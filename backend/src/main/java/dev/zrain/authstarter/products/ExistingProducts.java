package dev.zrain.authstarter.products;

import java.util.List;

/** Verified Zrain Ecosystem product inventory from the original public directory.
 * Imported as DRAFT for manual review. Never overwrites existing records.
 */
public final class ExistingProducts {
    private ExistingProducts() {}

    public static List<ProductInput> all() {
        return List.of(
            new ProductInput("guess-the-flag", "Guess The Flag",
                "Geography and flag challenges with 190 country flags.",
                Product.Category.GAMES, "/icons/guess-the-flag.webp",
                Product.Action.CONSOLE, "Play Now", "https://guesstheflag-zrain.web.app/",
                "Get on Google Play", "https://play.google.com/store/apps/details?id=com.zrain.guesstheflag", 10),
            new ProductInput("memory-rush", "Memory Rush",
                "Challenge your memory with Grid, Number and Pattern Recall.",
                Product.Category.GAMES, "/icons/memory-rush.webp",
                Product.Action.CONSOLE, "Play Now", "https://memoryrush-zrain.web.app/",
                "Get on Google Play", "https://play.google.com/store/apps/details?id=com.zrain.memoryrush", 20),
            new ProductInput("zrain-auth-starter", "Zrain Auth Starter",
                "Reusable Java Spring Boot authentication template with JWT and role-based access.",
                Product.Category.DEVELOPER_TOOLS, "/zrain-logo.webp",
                Product.Action.GITHUB, "View on GitHub", "https://github.com/zrain03/zrain-auth-starter",
                "Try Demo", "https://zrain03.github.io/zrain-auth-starter/", 10),
            new ProductInput("zrain-monitor", "Zrain Monitor",
                "Monitor public HTTPS services, review incidents and check uptime.",
                Product.Category.DEVELOPER_TOOLS, "/zrain-logo.webp",
                Product.Action.WEBSITE, "Open Web App", "https://zrain-monitor.web.app/",
                null, null, 20),
            new ProductInput("zrain-ui", "Zrain UI",
                "Shared design system and UI components for Zrain products.",
                Product.Category.DEVELOPER_TOOLS, "/zrain-logo.webp",
                Product.Action.GITHUB, "View on GitHub", "https://github.com/zrain03/zrain-ui",
                "View Showcase", "https://zrain.web.app/zrain-ui-showcase.html", 30),
            new ProductInput("zrain-links", "Zrain Links",
                "Create custom short links, QR previews and visits links.",
                Product.Category.ONLINE_SERVICES, "/zrain-logo.webp",
                Product.Action.WEBSITE, "Open Web App", "https://zrain-links.web.app/",
                null, null, 10)
        );
    }
}
