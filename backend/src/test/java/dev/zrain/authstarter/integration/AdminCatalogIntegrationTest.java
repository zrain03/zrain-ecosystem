package dev.zrain.authstarter.integration;

import dev.zrain.authstarter.products.ProductRepository;
import dev.zrain.authstarter.user.AppUser;
import dev.zrain.authstarter.user.Role;
import dev.zrain.authstarter.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminCatalogIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired ProductRepository products;
    @Autowired PasswordEncoder encoder;
    @Autowired JsonMapper mapper;

    @BeforeEach
    void setup() {
        products.deleteAll();
        users.deleteAll();
        users.saveAndFlush(new AppUser("admin@example.com", encoder.encode("LongUniqueTestPassword123!"), Role.ADMIN));
    }

    private String login() throws Exception {
        String content = mvc.perform(post("/api/admin/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"admin@example.com\",\"password\":\"LongUniqueTestPassword123!\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return mapper.readTree(content).get("accessToken").stringValue();
    }

    private static String form() {
        return """
                {
                  "slug":"sample-app",
                  "name":"Sample App",
                  "description":"A real product for integration testing",
                  "category":"WEB_UTILITIES",
                  "logoUrl":"/zrain-logo.webp",
                  "primaryAction":"WEBSITE",
                  "primaryLabel":"Open Web App",
                  "primaryUrl":"https://example.com/",
                  "secondaryLabel":"View on GitHub",
                  "secondaryUrl":"https://github.com/zrain03",
                  "sortOrder":1
                }
                """;
    }

    @Test
    void publicCatalogIsReadableButAdminRequiresAuthentication() throws Exception {
        mvc.perform(get("/api/products")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/api/admin/products")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/admin/products").contentType(MediaType.APPLICATION_JSON).content(form()))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"visitor@example.com\",\"password\":\"password\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminCanCreateDraftPublishEditAndUnpublish() throws Exception {
        String token = login();
        mvc.perform(get("/api/admin/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.role").value("ADMIN"));
        String body = mvc.perform(post("/api/admin/products")
                .header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                .content(form())).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn().getResponse().getContentAsString();
        String id = mapper.readTree(body).get("id").stringValue();
        mvc.perform(get("/api/products")).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(post("/api/admin/products/" + id + "/publish").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("PUBLISHED"));
        mvc.perform(get("/api/products"))
                .andExpect(jsonPath("$[0].slug").value("sample-app"))
                .andExpect(jsonPath("$[0].primaryAction").value("WEBSITE"));
        mvc.perform(post("/api/admin/products").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(form())).andExpect(status().isConflict());
        mvc.perform(put("/api/admin/products/" + id).header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(form().replace("Sample App", "Updated App")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Updated App"));
        mvc.perform(post("/api/admin/products/" + id + "/unpublish").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("DRAFT"));
        mvc.perform(get("/api/products")).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void malformedAndDangerousInputsAreRejected() throws Exception {
        String token = login();
        mvc.perform(post("/api/admin/products").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(form().replace("https://example.com/", "javascript:alert(1)")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/admin/products").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(form().replace("sample-app", "../wrong")))
                .andExpect(status().isBadRequest());
        assertEquals(0, products.count());
    }

    @Test
    void wrongCredentialsAndRemovedAdminCannotAccessProducts() throws Exception {
        mvc.perform(post("/api/admin/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"admin@example.com\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized());
        String token = login();
        users.deleteAll();
        mvc.perform(get("/api/admin/products").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }
    @Test
    void importExistingSixAsDraftsWithoutOverwritingAnything() throws Exception {
        mvc.perform(post("/api/admin/products/import-existing"))
                .andExpect(status().isUnauthorized());
        String token = login();

        mvc.perform(post("/api/admin/products/import-existing").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.added").value(6))
                .andExpect(jsonPath("$.skipped").value(0))
                .andExpect(jsonPath("$.totalAvailable").value(6));

        assertEquals(6, products.count());
        mvc.perform(get("/api/products")).andExpect(jsonPath("$.length()").value(0));

        var bySlug = products.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(p -> p.getSlug(), p -> p));
        assertEquals("https://github.com/zrain03/zrain-auth-starter", bySlug.get("zrain-auth-starter").getPrimaryUrl());
        assertEquals("View on GitHub", bySlug.get("zrain-ui").getPrimaryLabel());
        assertEquals("https://play.google.com/store/apps/details?id=com.zrain.memoryrush",
                bySlug.get("memory-rush").getSecondaryUrl());
        assertEquals(10, bySlug.get("guess-the-flag").getSortOrder());
        assertEquals(20, bySlug.get("memory-rush").getSortOrder());
        for (var item : bySlug.values()) assertEquals(dev.zrain.authstarter.products.Product.Status.DRAFT, item.getStatus());

        mvc.perform(post("/api/admin/products/import-existing").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.added").value(0))
                .andExpect(jsonPath("$.skipped").value(6));
        assertEquals(6, products.count());
    }

    @Test
    void productOrderIsGeneratedAndRemainsStableWhenEditing() throws Exception {
        String token = login();
        mvc.perform(post("/api/admin/products/import-existing").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        String body = mvc.perform(post("/api/admin/products")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(form().replace("\"category\":\"WEB_UTILITIES\"", "\"category\":\"GAMES\"")
                        .replace("\"sortOrder\":1", "\"sortOrder\":null")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sortOrder").value(30))
                .andReturn().getResponse().getContentAsString();
        String id = mapper.readTree(body).get("id").stringValue();

        mvc.perform(put("/api/admin/products/" + id)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(form().replace("\"category\":\"WEB_UTILITIES\"", "\"category\":\"GAMES\"")
                        .replace("Sample App", "Updated App")
                        .replace("\"sortOrder\":1", "\"sortOrder\":null")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sortOrder").value(30));
    }

    @Test
    void catalogSyncRequiresAdminAndConfiguredStorage() throws Exception {
        mvc.perform(get("/api/health"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ok"));
        mvc.perform(post("/api/admin/catalog/sync"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/catalog/status"))
                .andExpect(status().isUnauthorized());
        String token = login();
        mvc.perform(get("/api/admin/catalog/status").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.configured").value(false));
        mvc.perform(post("/api/admin/catalog/sync").header("Authorization", "Bearer " + token))
                .andExpect(status().isServiceUnavailable());
    }

}
