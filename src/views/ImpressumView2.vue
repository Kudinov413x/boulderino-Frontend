<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <main class="impressum-page">
        <div class="impressum-content">
            <!-- Header / Zurück-Link -->
            <header class="impressum-header">
                <RouterLink to="/" class="back-link">
                    ← Zurück zur Landing Page
                </RouterLink>
                <h1>Impressum</h1>
            </header>

            <!-- Inhalt des Impressums -->
            <div class="impressum-card">
                <section class="impressum-section">
                    <h2>Angaben zum Autor</h2>
                    <p>
                        Alexander Kudinov<br>
                        Morianstraße 25<br>
                        42103 Wuppertal
                    </p>
                </section>

                <section class="impressum-section">
                    <h2>Kontakt</h2>
                    <p>
                        Telefon: +49 1578 8287859<br>
                        E-Mail: <a href="mailto:alexkudinov99@gmail.com">alexkudinov99@gmail.com</a>
                    </p>
                </section>
            </div>
        </div>
    </main>
</template>

<style scoped>
.impressum-page {
    min-height: 100vh;
    padding: 6rem 3rem;
    background: #0f0f0f;
    color: white;
}

.impressum-content {
    max-width: 800px;
    margin: 0 auto;
}

.impressum-header {
    margin-bottom: 2.5rem;
}

.back-link {
    display: inline-block;
    margin-bottom: 1.5rem;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    text-decoration: none;
    transition: color 0.2s ease;
}

.back-link:hover {
    color: white;
}

.impressum-header h1 {
    margin: 0;
    font-size: clamp(2.5rem, 5vw, 4rem);
    letter-spacing: -0.04em;
}

.subtitle {
    margin: 0.5rem 0 0;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.9rem;
}

.impressum-card {
    padding: 2.5rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.025);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.impressum-section {
    margin-bottom: 2rem;
}

.impressum-section:last-child {
    margin-bottom: 0;
}

.impressum-section h2 {
    margin: 0 0 0.75rem;
    font-size: 1.15rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 0.5rem;
}

.impressum-section h3 {
    margin: 1.25rem 0 0.4rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
}

.impressum-section p {
    margin: 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    line-height: 1.6;
}

.impressum-section a {
    color: white;
    text-decoration: underline;
}

.impressum-section a:hover {
    color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 700px) {
    .impressum-page {
        padding: 4rem 1.25rem;
    }
    
    .impressum-card {
        padding: 1.5rem;
    }
}
</style>