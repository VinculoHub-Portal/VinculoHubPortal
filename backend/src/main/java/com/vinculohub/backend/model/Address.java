import javax.persistence.*;
@Entity
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String state;

    @Column(name = "state_code")
    private String stateCode;

    private String city;

    private String street;

    private String number;

    private String complement;

    @Column(name = "zip_code")
    private String zipCode;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}