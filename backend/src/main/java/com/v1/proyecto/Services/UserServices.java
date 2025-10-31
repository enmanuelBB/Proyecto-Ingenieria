package com.v1.proyecto.Services;
import com.v1.proyecto.auth.model.Users;
import com.v1.proyecto.model.UsersDto;
import com.v1.proyecto.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class UserServices {

    @Autowired
    private UserRepository userRepository;

    public Users create(UsersDto dto) {
        Users user = new Users();
        user.setName(dto.getName());
        user.setLastname(dto.getLastname());
        user.setPhone_number(dto.getPhone_number());
        user.setAddress(dto.getAddress());
        user.setEmail(dto.getEmail());

        return userRepository.save(user);
    }

    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<Users> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public boolean updateUser(Long id, UsersDto dto) {
        Optional<Users> userOptional = userRepository.findById(id);

        if (userOptional.isPresent()) {
            Users user = userOptional.get();
            user.setName(dto.getName());
            user.setLastname(dto.getLastname());
            user.setPhone_number(dto.getPhone_number());
            user.setAddress(dto.getAddress());
            user.setEmail(dto.getEmail());
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
