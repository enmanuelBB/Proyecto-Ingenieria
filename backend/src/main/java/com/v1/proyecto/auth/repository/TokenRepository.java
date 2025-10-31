package com.v1.proyecto.auth.repository;

import com.v1.proyecto.auth.model.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface TokenRepository extends JpaRepository<Token, Integer> {

    @Query(value = """
            select t from tokens t inner join t.user u
            where u.Id = :userId and (t.isExpired = false or t.isRevoked = false)
            """)

    List<Token> findAllValidTokenByUser(@Param("userId") Long id);

    Optional<Token> findByToken(String token);
}
