package com.smartstudy.platform.controller;

import com.smartstudy.platform.dto.request.LoginRequest;
import com.smartstudy.platform.dto.request.RegisterRequest;
import com.smartstudy.platform.dto.request.UpdateProfileRequest;
import com.smartstudy.platform.dto.response.JwtResponse;
import com.smartstudy.platform.dto.response.MessageResponse;
import com.smartstudy.platform.model.Role;
import com.smartstudy.platform.model.User;
import com.smartstudy.platform.repository.UserRepository;
import com.smartstudy.platform.security.JwtUtils;
import com.smartstudy.platform.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getFullName(),
                roles));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur : Ce nom d'utilisateur est déjà pris !", false));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur : Cette adresse email est déjà utilisée !", false));
        }

        User user = new User(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getFullName() != null ? signUpRequest.getFullName() : signUpRequest.getUsername());

        Set<Role> roles = new HashSet<>();
        roles.add(Role.ROLE_USER);
        user.setRoles(roles);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Utilisateur enregistré avec succès !"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Non authentifié", false));
        }
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                           @RequestBody UpdateProfileRequest request) {
        if (userDetails == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Non authentifié", false));
        }

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getTargetStudyHoursPerWeek() > 0) user.setTargetStudyHoursPerWeek(request.getTargetStudyHoursPerWeek());
        if (request.getGeminiApiKey() != null) user.setGeminiApiKey(request.getGeminiApiKey());
        if (request.getOpenaiApiKey() != null) user.setOpenaiApiKey(request.getOpenaiApiKey());

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPassword(encoder.encode(request.getNewPassword()));
        }

        userRepository.save(user);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }
}
