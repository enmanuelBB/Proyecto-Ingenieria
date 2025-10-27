package com.v1.proyecto.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsersDto {

    private String name;
    private String lastname;
    private String phone_number;
    private String address;
    private String email;
}
