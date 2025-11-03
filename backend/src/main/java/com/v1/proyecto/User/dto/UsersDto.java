package com.v1.proyecto.User.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UsersDto {

    private String name;
    private String lastname;
    private String phone_number;
    private String address;
    private String email;

}
