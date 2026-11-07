<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <main class="privacy-page">
        <div class="privacy-content">
            <!-- Header / Zurück-Link -->
            <header class="privacy-header">
                <RouterLink to="/" class="back-link">
                    ← Zurück zur Landing Page
                </RouterLink>
                <h1>Datenschutzerklärung</h1>
                <p class="subtitle">Hinweise zum Schutz deiner Daten</p>
            </header>

            <!-- Inhalt der Datenschutzerklärung -->
            <div class="privacy-card">
                <section class="privacy-section">
                    <h2>1. Datenschutz auf einen Blick</h2>
                    <h3>Allgemeine Hinweise</h3>
                    <p>
                        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                    </p>

                    <h3>Datenerfassung auf dieser Website</h3>
                    <p>
                        <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br>
                        Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle“ in dieser Datenschutzerklärung entnehmen.
                    </p>
                </section>

                <section class="privacy-section">
                    <h2>2. Hosting</h2>
                    <p>
                        Wir hosten die Inhalte unserer Website bei folgendem Anbieter: [Name des Hosters, z.B. Vercel, Netlify oder eigener Server] und den entsprechenden Kontaktdaten. Wenn Sie mehr erfahren möchten, verweisen wir auf die Datenschutzerklärung des Hosters.
                    </p>
                </section>

                <section class="privacy-section">
                    <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
                    <h3>Datenschutz</h3>
                    <p>
                        Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                    </p>

                    <h3>Hinweis zur verantwortlichen Stelle</h3>
                    <p>
                        Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br><br>
                        Max Mustermann<br>
                        Musterstraße 123<br>
                        12345 Musterstadt<br>
                        Telefon: +49 (0) 123 445566<br>
                        E-Mail: kontakt@boulder-tagebuch.de
                    </p>
                </section>

                <section class="privacy-section">
                    <h2>4. Datenerfassung auf dieser Website</h2>
                    <h3>Boulder-Tagebuch & Sessions</h3>
                    <p>
                        Da es sich bei deinem Boulder-Tagebuch um eine Anwendung mit Benutzerdaten (wie Sessions, Boulder-Projekten und Statistiken) handelt, werden diese Daten verarbeitet, um dir deine Trainingsfortschritte anzuzeigen. Die Speicherung erfolgt im Rahmen der Erforderlichkeit zur Bereitstellung der App-Funktionen.
                    </p>

                    <h3>Cookies</h3>
                    <p>
                        Unsere Website verwendet teilweise sogenannte Cookies. Cookies richten auf Ihrem Rechner keinen Schaden an und enthalten keine Viren. Sie dienen dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
                    </p>
                </section>
            </div>
        </div>
    </main>
</template>

<style scoped>
.privacy-page {
    min-height: 100vh;
    padding: 6rem 3rem;
    background: #0f0f0f;
    color: white;
}

.privacy-content {
    max-width: 800px;
    margin: 0 auto;
}

.privacy-header {
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

.privacy-header h1 {
    margin: 0;
    font-size: clamp(2.5rem, 5vw, 4rem);
    letter-spacing: -0.04em;
}

.subtitle {
    margin: 0.5rem 0 0;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.9rem;
}

.privacy-card {
    padding: 2.5rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.025);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.privacy-section {
    margin-bottom: 2rem;
}

.privacy-section:last-child {
    margin-bottom: 0;
}

.privacy-section h2 {
    margin: 0 0 0.75rem;
    font-size: 1.15rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 0.5rem;
}

.privacy-section h3 {
    margin: 1.25rem 0 0.4rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
}

.privacy-section p {
    margin: 0 0 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    line-height: 1.6;
}

.privacy-section p:last-child {
    margin-bottom: 0;
}

.privacy-section a {
    color: white;
    text-decoration: underline;
}

.privacy-section a:hover {
    color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 700px) {
    .privacy-page {
        padding: 4rem 1.25rem;
    }
    
    .privacy-card {
        padding: 1.5rem;
    }
}
</style>