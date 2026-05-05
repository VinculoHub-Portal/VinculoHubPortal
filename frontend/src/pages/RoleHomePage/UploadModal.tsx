import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Typography, 
  Box, 
  IconButton 
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as UploadIcon } from '@mui/icons-material';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, title: string, description: string) => void;
}

const UploadModal = ({ isOpen, onClose, onUpload }: UploadDocumentModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    onClose();
  };

  const handleSubmit = () => {
    if (file && title) {
      onUpload(file, title, description);
      handleClose();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">Enviar Documento</Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
          
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom sx={{ color: '#374151' }}>
              Título do documento *
            </Typography>
            <TextField
              fullWidth
              placeholder="Ex: Estatuto Social da ONG"
              variant="outlined"
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Box>

          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom sx={{ color: '#374151' }}>
              Descrição do documento *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Descreva os detalhes deste documento..."
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>

          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom sx={{ color: '#374151' }}>
              Documentos Anexos
            </Typography>
            <Box
              component="label"
              sx={{
                border: '2px dashed #e0e7ff',
                borderRadius: 2,
                p: 4,
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: '#f8faff',
                width: '100%',
                boxSizing: 'border-box', 
                '&:hover': { bgcolor: '#f0f4ff' }
              }}
            >
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.xls,.jpg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <UploadIcon sx={{ fontSize: 40, color: '#3f51b5', mb: 1 }} />
              <Typography color="primary" fontWeight="medium" sx={{ display: 'block', width: '100%' }}>
                Clique para fazer upload
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', width: '100%' }}>
                PDF, DOC, XLS, JPG ou PNG (máx. 10MB)
              </Typography>
              
              {file && (
                <Typography variant="body2" sx={{ mt: 2, color: 'success.main', fontWeight: 'bold' }}>
                  Selecionado: {file.name}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          fullWidth 
          onClick={handleSubmit}
          disabled={!file || !title}
          sx={{ 
            textTransform: 'none', 
            py: 1.5, 
            fontWeight: 'bold', 
            bgcolor: '#67ac74',
            '&:hover': { bgcolor: '#5a9665' },
            m: '0 !important' 
          }}
        >
          + Adicionar documento
        </Button>
        <Button 
          variant="outlined" 
          fullWidth 
          onClick={handleClose}
          sx={{ 
            textTransform: 'none', 
            py: 1.5, 
            fontWeight: 'bold', 
            color: '#374151', 
            borderColor: '#d1d5db',
            m: '0 !important'
          }}
        >
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadModal;