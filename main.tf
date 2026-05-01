provider "aws" {
  region = "us-east-1"
}


# Segurança(Security Groups)


# Security Group para o Backend e Docker Swarm
resource "aws_security_group" "backend_sg" {
  name        = "vinculohub-backend-sg"
  description = "Permitir SSH, API (8080) e comunicacao Docker"

  # Acesso SSH para administração
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  # Porta do Backend (Spring Boot / NestJS)
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Saída liberada para a internet (necessário para baixar pacotes e Docker images)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "VinculoHub-SG"
  }
}

# Armazenamento: S3 Bucket para Documentos
resource "aws_s3_bucket" "vinculohub_storage" {
  bucket = "vinculohub-portal-storage"

  tags = {
    Project  = "VinculoHub"
    Semester = "2026/1"
  }
}

# Configuração de CORS
resource "aws_s3_bucket_cors_configuration" "vinculohub_cors" {
  bucket = aws_s3_bucket.vinculohub_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    # Origens baseadas no seu .env de desenvolvimento e produção
    allowed_origins = ["http://localhost:5173", "http://localhost"] 
    max_age_seconds = 3000
  }
}


# Computação: Instâncias EC2

# Instância para o Backend e Docker Swarm Manager
resource "aws_instance" "backend_server" {
  ami                    = "ami-0c55b159cbfafe1f0" # Amazon Linux 2 (Verifique a região)
  instance_type          = "t3.medium"
  key_name               = "vinculohub-key"
  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  tags = {
    Name = "VinculoHub-Backend"
  }
}

# Instância para o Frontend 
resource "aws_instance" "frontend_server" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t3.small"
  key_name               = "vinculohub-key"
  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  tags = {
    Name = "VinculoHub-Frontend"
  }
}


# Persistência: Volume EBS para PostgreSQL
resource "aws_ebs_volume" "postgres_data" {
  availability_zone = aws_instance.backend_server.availability_zone
  size              = 20
  type              = "gp3"

  tags = {
    Name = "Postgres-Persistence"
  }
}

# Anexo do volume à instância do Backend
resource "aws_volume_attachment" "ebs_att" {
  device_name = "/dev/sdh"
  volume_id   = aws_ebs_volume.postgres_data.id
  instance_id = aws_instance.backend_server.id
}