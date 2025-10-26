package com.v1.tarea1;

import java.util.Base64;

public class KeyGenerator {
    public static void main(String[] args) {
        String rawKey = "miClaveSecretaSuperSegura1234567890";
        String base64Key = Base64.getEncoder().encodeToString(rawKey.getBytes());
        System.out.println("Clave en Base64: " + base64Key);
    }
}

