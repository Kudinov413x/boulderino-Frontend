<script setup lang="ts">
</script>

<template>
    <main class="impressum-page">
        <div class="impressum-container">

            <p class="eyebrow">Above The Clouds</p>

            <h1>Impressum</h1>

            <section class="impressum-section">
                <h2>Angaben zum Autor</h2>

                <p>
                    Alexander Kudinov<br>
                    04.05.1999 <br>
                    42103 Wuppertal<br>
                    Deutschland
                </p>
            </section>

            <section class="impressum-section">
                <h2>Kontakt</h2>

                <p>
                    E-Mail:
                    <a href="mailto:deine-email@example.com">
                        alexkudinov99@gmail.com
                    </a>
                </p>
            </section>
        </div>
    </main>
</template>

<style scoped>
.impressum-page {
    min-height: calc(100vh - 70px);
    padding: 5rem 1.5rem;

    background:
        radial-gradient(
            ellipse at top,
            rgba(255, 255, 255, 0.045),
            transparent 55%
        ),
        #0f0f0f;

    color: white;
}

.impressum-container {
    width: 100%;
    max-width: 850px;
    margin: 0 auto;
}

.eyebrow {
    margin-bottom: 1rem;

    color: rgba(255, 255, 255, 0.45);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.3em;
}

h1 {
    margin: 0;

    font-size: clamp(2.8rem, 6vw, 4.5rem);
    font-weight: 700;
    letter-spacing: -0.04em;
}

.intro {
    margin-top: 1rem;
    margin-bottom: 3.5rem;

    color: rgba(255, 255, 255, 0.55);
    font-size: 1rem;
}

.impressum-section {
    padding: 1.8rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.impressum-section h2 {
    margin: 0 0 1rem;

    color: rgba(255, 255, 255, 0.95);
    font-size: 1.15rem;
    font-weight: 600;
}

.impressum-section p {
    margin: 0;

    color: rgba(255, 255, 255, 0.65);
    font-size: 0.95rem;
    line-height: 1.9;
}

.impressum-section a {
    color: white;
    text-decoration: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    transition: border-color 0.2s ease;
}

.impressum-section a:hover {
    border-color: white;
}

@media (max-width: 600px) {
    .impressum-page {
        padding: 3rem 1.25rem;
    }

    .intro {
        margin-bottom: 2.5rem;
    }

    .impressum-section {
        padding: 1.4rem 0;
    }
}
</style>