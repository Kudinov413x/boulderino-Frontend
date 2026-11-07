<script setup lang="ts">
import profileImage from '@/assets/images/BBL.jpeg'

const technologies = {
    backend: [
        { name: 'Java', description: 'Backend Development' },
        { name: 'Spring Boot', description: 'Application Framework' },
        { name: 'SQL', description: 'Relational Databases' },
        { name: 'REST APIs', description: 'API Architecture' }
    ],
    frontend: [
        { name: 'Vue.js', description: 'Frontend Framework' },
        { name: 'TypeScript', description: 'Typed JavaScript' },
        { name: 'JavaScript', description: 'Web Development' },
        { name: 'Responsive Design', description: 'Adaptive Web Systems' }
    ]
}

const focusAreas = [
    {
        number: '01',
        title: 'REST API Architecture',
        description:
            'Konzeption und Entwicklung strukturierter REST-Schnittstellen für eine klare Kommunikation zwischen Frontend und Backend.'
    },
    {
        number: '02',
        title: 'Full-Stack Development',
        description:
            'Entwicklung ganzheitlicher Webanwendungen – von der Backend-Logik und Datenbank bis zur interaktiven Benutzeroberfläche.'
    },
    {
        number: '03',
        title: 'Context-Aware Applications',
        description:
            'Entwicklung von Software mit datengesteuerten, dynamischen Anpassungsmechanismen auf Basis von Nutzerinteraktionen.'
    },
    {
        number: '04',
        title: 'Adaptive Web Systems',
        description:
            'Entwicklung responsiver und benutzerfreundlicher Anwendungen, die sich an unterschiedliche Geräte und Bildschirmgrößen anpassen.'
    }
]
</script>

<template>
    <main class="about-page">
        <div class="about-container">

            <!-- HERO -->
            <section class="hero-section">
                <div class="hero-content">
                    <p class="eyebrow">ABOUT ME · DEVELOPER PORTFOLIO</p>

                    <h1>
                        Alexander<br>
                        <span>Kudinov.</span>
                    </h1>

                    <h2>Full-Stack Java Developer</h2>

                    <p class="hero-description">
                        Ich entwickle moderne Webanwendungen mit Java,
                        Spring Boot und Vue.js. Mein Fokus liegt auf
                        durchdachten REST-API-Architekturen, adaptiven
                        Websystemen und sauberer Softwareentwicklung.
                    </p>

                    <div class="hero-tags">
                        <span>Java</span>
                        <span>Spring Boot</span>
                        <span>Vue.js</span>
                        <span>TypeScript</span>
                    </div>

                    <div class="hero-actions">
                        <a href="mailto:alexkudinov99@gmail.com" class="primary-button">
                            Kontakt aufnehmen <span>↗</span>
                        </a>
                        <a href="#projects" class="secondary-button">
                            Meine Projekte
                        </a>
                    </div>
                </div>

                <div class="hero-visual">
                    <div class="visual-card">
                        <div class="visual-top">
                            <span class="status-dot"></span>
                            <span>DEVELOPER PROFILE</span>
                        </div>

                        <div class="visual-content">
                            <div class="code-visual">
                                <p><span class="code-purple">const</span> developer = {</p>
                                <p class="indent">
                                    name: <span class="code-green">'Alexander Kudinov'</span>,
                                </p>
                                <p class="indent">
                                    age: <span class="code-green">'27'</span>,
                                </p>
                                <p class="indent">
                                    role: <span class="code-green">'Full-Stack Developer'</span>,
                                </p>
                                <p class="indent">
                                    backend: <span class="code-green">'Java / Spring Boot'</span>,
                                </p>
                                <p class="indent">
                                    frontend: <span class="code-green">'Vue / TypeScript'</span>,
                                </p>
                                <p class="indent">
                                    focus: <span class="code-green">'Web Development'</span>
                                </p>
                                <p class="indent">
                                    favoriteAnimal: <span class="code-green">'Kiwis'</span>
                                </p>
                                <p>}</p>
                            </div>

                            <img
                                :src="profileImage"
                                alt="Portrait von Alexander Kudinov"
                                class="developer-avatar"
                            />
                        </div>

                        <div class="visual-bottom">
                            <span>INFORMATICS B.SC.</span>
                            <span>2026</span>
                        </div>
                    </div>

                    <div class="visual-decoration decoration-one"></div>
                    <div class="visual-decoration decoration-two"></div>
                </div>
            </section>

            <!-- ABOUT -->
            <section class="content-section">
                <div class="section-heading">
                    <p class="eyebrow">01 / INTRODUCTION</p>
                    <h2>Über mich<span>.</span></h2>
                </div>

                <div class="about-text">
                    <p class="lead">
                        Ich habe 2026 meinen Bachelorabschluss in Informatik
                        erworben und beschäftige mich mit der Entwicklung
                        moderner, skalierbarer Webanwendungen.
                    </p>

                    <p>
                        Besonders interessiert mich die Verbindung von
                        zuverlässiger Backend-Architektur und intuitiven
                        Benutzeroberflächen. Ich arbeite gerne am gesamten
                        Entwicklungsprozess einer Anwendung – von der
                        Konzeption und Datenmodellierung über die Entwicklung
                        von REST-Schnittstellen bis hin zur Umsetzung des
                        Frontends.
                    </p>

                    <p>
                        Dabei lege ich Wert auf sauberen, verständlichen Code,
                        eine durchdachte Struktur und Lösungen, die sich
                        langfristig erweitern und warten lassen.
                    </p>
                </div>
            </section>

            <!-- TECHNOLOGIES -->
            <section class="content-section">
                <div class="section-heading">
                    <p class="eyebrow">02 / TECHNOLOGIES</p>
                    <h2>Mein Tech Stack<span>.</span></h2>
                    <p class="section-description">
                        Technologien, mit denen ich Anwendungen konzipiere
                        und entwickle.
                    </p>
                </div>

                <div class="tech-grid">
                    <div class="tech-card">
                        <div class="tech-card-heading">
                            <span class="tech-icon">⌘</span>
                            <div>
                                <h3>Backend</h3>
                                <p>Server & Datenarchitektur</p>
                            </div>
                        </div>

                        <div class="tech-list">
                            <div
                                v-for="tech in technologies.backend"
                                :key="tech.name"
                                class="tech-item"
                            >
                                <div>
                                    <strong>{{ tech.name }}</strong>
                                    <span>{{ tech.description }}</span>
                                </div>
                                <span class="tech-arrow">↗</span>
                            </div>
                        </div>
                    </div>

                    <div class="tech-card">
                        <div class="tech-card-heading">
                            <span class="tech-icon">◈</span>
                            <div>
                                <h3>Frontend</h3>
                                <p>Interfaces & User Experience</p>
                            </div>
                        </div>

                        <div class="tech-list">
                            <div
                                v-for="tech in technologies.frontend"
                                :key="tech.name"
                                class="tech-item"
                            >
                                <div>
                                    <strong>{{ tech.name }}</strong>
                                    <span>{{ tech.description }}</span>
                                </div>
                                <span class="tech-arrow">↗</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- FOCUS AREAS -->
            <section class="content-section">
                <div class="section-heading">
                    <p class="eyebrow">03 / WHAT I DO</p>
                    <h2>Meine Schwerpunkte<span>.</span></h2>
                </div>

                <div class="focus-list">
                    <article
                        v-for="focus in focusAreas"
                        :key="focus.number"
                        class="focus-item"
                    >
                        <span class="focus-number">{{ focus.number }}</span>
                        <div>
                            <h3>{{ focus.title }}</h3>
                            <p>{{ focus.description }}</p>
                        </div>
                        <span class="focus-arrow">↗</span>
                    </article>
                </div>
            </section>

            <!-- PROJECT -->
            <section id="projects" class="content-section project-section">
                <div class="section-heading">
                    <p class="eyebrow">04 / FEATURED PROJECT</p>
                    <h2>Was ich entwickle<span>.</span></h2>
                </div>

                <div class="project-card">
                    <div class="project-content">
                        <div class="project-label">
                            <span class="status-dot"></span>
                            PERSONAL PROJECT
                        </div>

                        <h3>boulderino<span>.</span></h3>

                        <p class="project-subtitle">
                            Eine Full-Stack-Webanwendung für Boulderbegeisterte.
                        </p>

                        <p class="project-description">
                            Mit boulderino entwickle ich eine Anwendung,
                            die das Dokumentieren, Verwalten und Analysieren
                            von Bouldersessions ermöglicht.
                        </p>

                        <p class="project-description">
                            Das Projekt verbindet ein Java-Backend mit
                            Spring Boot und ein modernes Vue.js-Frontend.
                            Über REST-Schnittstellen kommunizieren die
                            Anwendungsschichten miteinander. Eine relationale
                            SQL-Datenbank bildet die Grundlage für die
                            Datenverwaltung.
                        </p>

                        <div class="project-tags">
                            <span>Java</span>
                            <span>Spring Boot</span>
                            <span>Vue.js</span>
                            <span>TypeScript</span>
                            <span>SQL</span>
                            <span>REST API</span>
                        </div>

                        <!-- Hier später deine echten Projekt-Links einsetzen -->
                        <div class="project-links">
                            <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
                                GitHub <span>↗</span>
                            </a>
                        </div>
                    </div>

                    <div class="project-visual">
                        <div class="project-window">
                            <div class="window-header">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>

                            <div class="dashboard-preview">
                                <div class="preview-heading">
                                    <div>
                                        <span>BOULDERINO</span>
                                        <strong>Progress Overview</strong>
                                    </div>
                                    <span class="preview-avatar">AK</span>
                                </div>

                                <div class="preview-stats">
                                    <div>
                                        <span>BOULDERS</span>
                                        <strong>128</strong>
                                    </div>
                                    <div>
                                        <span>TOPS</span>
                                        <strong>86</strong>
                                    </div>
                                </div>

                                <div class="preview-chart">
                                    <div class="chart-line line-one"></div>
                                    <div class="chart-line line-two"></div>
                                    <div class="chart-line line-three"></div>
                                </div>
                                <span class="preview-caption">
                                    YOUR CLIMBING PROGRESS
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CAREER -->
            <section class="content-section">
                <div class="section-heading">
                    <p class="eyebrow">05 / NEXT STEP</p>
                    <h2>Wohin ich möchte<span>.</span></h2>
                </div>

                <div class="career-card">
                    <p>
                        Nach meinem Bachelorabschluss möchte ich meine
                        Kenntnisse als Full-Stack Java Developer in der
                        Praxis vertiefen und mich fachlich wie persönlich
                        weiterentwickeln.
                    </p>

                    <p>
                        Ich freue mich darauf, in einem Entwicklerteam
                        Verantwortung zu übernehmen, von erfahrenen
                        Kollegen zu lernen und gemeinsam an modernen
                        Softwarelösungen zu arbeiten.
                    </p>
                </div>
            </section>

            <!-- CONTACT -->
            <section class="contact-section">
                <p class="eyebrow">LET'S CONNECT</p>
                <h2>Lass uns zusammenarbeiten<span>.</span></h2>
                <p>
                    Du hast eine interessante Herausforderung oder möchtest
                    dich mit mir austauschen? Ich freue mich auf deine Nachricht.
                </p>

                <div class="contact-links">
                    <a href="mailto:alexkudinov99@gmail.com" class="primary-button">
                        E-Mail schreiben <span>↗</span>
                    </a>
                    <a
                        href="https://www.linkedin.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="secondary-button"
                    >
                        LinkedIn <span>↗</span>
                    </a>
                    <a
                        href="https://github.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="secondary-button"
                    >
                        GitHub <span>↗</span>
                    </a>
                </div>
            </section>

        </div>
    </main>
</template>

<style scoped>
.about-page {
    min-height: calc(100vh - 70px);
    padding: 4rem 1.5rem 6rem;
    background:
        radial-gradient(
            ellipse at 80% 5%,
            rgba(130, 100, 255, 0.08),
            transparent 35%
        ),
        radial-gradient(
            ellipse at 10% 35%,
            rgba(255, 255, 255, 0.035),
            transparent 40%
        ),
        #0f0f0f;
    color: white;
    overflow: hidden;
}

.about-container {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
}

.eyebrow {
    margin: 0 0 1.2rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.25em;
}

/* HERO */

.hero-section {
    min-height: 530px;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    align-items: center;
    gap: 3rem;
    padding: 2rem 0 5rem;
}

.hero-content h1 {
    margin: 0;
    font-size: clamp(3.5rem, 7vw, 6rem);
    line-height: 0.98;
    letter-spacing: -0.065em;
    font-weight: 800;
}

.hero-content h1 span {
    color: rgba(255, 255, 255, 0.35);
}

.hero-content h2 {
    margin: 1.5rem 0 1rem;
    font-size: 1.25rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
}

.hero-description {
    max-width: 510px;
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.98rem;
    line-height: 1.9;
}

.hero-tags,
.project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    margin-top: 1.7rem;
}

.hero-tags span,
.project-tags span {
    padding: 0.5rem 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.035);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
}

.hero-actions,
.contact-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 2rem;
}

.primary-button,
.secondary-button {
    min-height: 45px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    padding: 0.75rem 1.15rem;
    border-radius: 6px;
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.2s ease;
}

.primary-button {
    background: white;
    color: #111;
}

.primary-button:hover {
    background: #d9d9d9;
    transform: translateY(-2px);
}

.secondary-button {
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: white;
}

.secondary-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.4);
}

/* CODE VISUAL */

.hero-visual {
    position: relative;
    padding: 2rem 0;
}

.visual-card {
    position: relative;
    z-index: 1;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    background: rgba(25, 25, 25, 0.9);
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35);
}

.visual-top,
.visual-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.13em;
}

.status-dot {
    width: 7px;
    height: 7px;
    display: inline-block;
    border-radius: 50%;
    background: #7bdba0;
    box-shadow: 0 0 12px rgba(123, 219, 160, 0.5);
}

.code-visual {
    margin: 2.5rem 0;
    font-family: monospace;
    font-size: clamp(0.7rem, 1.2vw, 0.85rem);
    line-height: 2.2;
    color: rgba(255, 255, 255, 0.75);
    overflow-x: auto;
    min-width: 0;
}

.code-visual p {
    margin: 0;
    white-space: nowrap;
}

.code-visual .indent {
    padding-left: 1.2rem;
}

.code-purple {
    color: #c4a5ff;
}

.code-green {
    color: #9ed9ad;
}

.visual-bottom {
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.visual-decoration {
    position: absolute;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
}

.decoration-one {
    inset: 0.5rem -0.8rem 2.5rem 1.5rem;
    transform: rotate(4deg);
}

.decoration-two {
    inset: 2rem 1.5rem 0.5rem -0.8rem;
    transform: rotate(-4deg);
}

.visual-content {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: start;
    gap: 1rem;
    margin-top: 2rem;
}

.developer-avatar {
    width: 150px;
    height: 150px;
    flex-shrink: 0;
    border-radius: 50%;
    object-fit: cover;
    object-position: center 6%;
    border: 2px solid rgba(196, 165, 255, 0.7);
    position: relative;
    left: -10px;  /* nach rechts */
    top: -10px;    /* nach unten */
}

/* GENERAL SECTIONS */

.content-section {
    padding: 4rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.section-heading {
    margin-bottom: 2rem;
}

.section-heading h2,
.contact-section h2 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 3rem);
    letter-spacing: -0.045em;
    font-weight: 700;
}

.section-heading h2 span,
.contact-section h2 span,
.project-content h3 span {
    color: rgba(255, 255, 255, 0.35);
}

.section-description {
    margin-top: 0.8rem;
    color: rgba(255, 255, 255, 0.45);
    line-height: 1.7;
}

.about-text {
    max-width: 790px;
}

.about-text p,
.career-card p {
    color: rgba(255, 255, 255, 0.58);
    font-size: 0.95rem;
    line-height: 2;
}

.about-text .lead {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.25rem;
    line-height: 1.8;
}

/* TECHNOLOGY */

.tech-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
}

.tech-card {
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.025);
}

.tech-card-heading {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.tech-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.08);
    font-size: 1.3rem;
}

.tech-card-heading h3 {
    margin: 0;
    font-size: 1.05rem;
}

.tech-card-heading p {
    margin: 0.3rem 0 0;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.75rem;
}

.tech-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.9rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.tech-item strong,
.tech-item span {
    display: block;
}

.tech-item strong {
    font-size: 0.88rem;
    font-weight: 600;
}

.tech-item div span {
    margin-top: 0.25rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.72rem;
}

.tech-arrow {
    color: rgba(255, 255, 255, 0.3);
}

/* FOCUS */

.focus-list {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.focus-item {
    display: grid;
    grid-template-columns: 55px 1fr 30px;
    align-items: start;
    gap: 1rem;
    padding: 1.6rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: padding 0.2s ease;
}

.focus-item:hover {
    padding-left: 0.5rem;
}

.focus-number {
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.8rem;
    font-family: monospace;
}

.focus-item h3 {
    margin: 0 0 0.6rem;
    font-size: 1.1rem;
}

.focus-item p {
    max-width: 700px;
    margin: 0;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.88rem;
    line-height: 1.8;
}

.focus-arrow {
    color: rgba(255, 255, 255, 0.3);
}

/* PROJECT */

.project-card {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 2rem;
    align-items: center;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    background:
        radial-gradient(
            ellipse at 90% 50%,
            rgba(120, 100, 255, 0.1),
            transparent 60%
        ),
        rgba(255, 255, 255, 0.025);
}

.project-label {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.15em;
}

.project-content h3 {
    margin: 1.2rem 0 0.5rem;
    font-size: clamp(2.5rem, 5vw, 4rem);
    letter-spacing: -0.06em;
}

.project-subtitle {
    color: rgba(255, 255, 255, 0.85);
    font-size: 1rem;
}

.project-description {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    line-height: 1.85;
}

.project-tags {
    margin-top: 1.3rem;
}

.project-links {
    margin-top: 1.5rem;
}

.project-links a {
    color: white;
    text-decoration: none;
    font-size: 0.85rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.4);
    padding-bottom: 0.3rem;
}

.project-visual {
    min-width: 0;
}

.project-window {
    padding: 0.6rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 9px;
    background: #171717;
    transform: rotate(2deg);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}

.window-header {
    display: flex;
    gap: 5px;
    padding: 0.4rem 0.5rem 0.8rem;
}

.window-header span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
}

.dashboard-preview {
    padding: 1.1rem;
    border-radius: 5px;
    background: #202020;
}

.preview-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.preview-heading div span,
.preview-heading div strong {
    display: block;
}

.preview-heading div span {
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.48rem;
    letter-spacing: 0.12em;
}

.preview-heading div strong {
    margin-top: 0.4rem;
    font-size: 0.85rem;
}

.preview-avatar {
    width: 27px;
    height: 27px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    font-size: 0.6rem;
}

.preview-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
    margin-top: 1rem;
}

.preview-stats div {
    padding: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 5px;
}

.preview-stats span,
.preview-stats strong {
    display: block;
}

.preview-stats span {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.48rem;
}

.preview-stats strong {
    margin-top: 0.35rem;
    font-size: 1.2rem;
}

.preview-chart {
    position: relative;
    height: 100px;
    margin-top: 1rem;
    overflow: hidden;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: repeating-linear-gradient(
        to bottom,
        transparent 0,
        transparent 24px,
        rgba(255, 255, 255, 0.06) 25px
    );
}

.chart-line {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    border-radius: 100%;
    transform-origin: left;
}

.line-one {
    top: 65%;
    background: #b5a0ff;
    clip-path: polygon(0 100%, 15% 70%, 28% 85%, 43% 30%, 58% 55%, 75% 10%, 90% 30%, 100% 0, 100% 100%);
}

.line-two {
    top: 45%;
    background: #8bd8a6;
    clip-path: polygon(0 100%, 15% 80%, 28% 65%, 43% 90%, 58% 25%, 75% 50%, 90% 0, 100% 30%, 100% 100%);
}

.line-three {
    top: 80%;
    background: #e8b879;
    clip-path: polygon(0 100%, 15% 50%, 28% 75%, 43% 60%, 58% 85%, 75% 25%, 90% 50%, 100% 0, 100% 100%);
}

.preview-caption {
    display: block;
    margin-top: 0.6rem;
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.45rem;
    letter-spacing: 0.12em;
}

/* CAREER */

.career-card {
    max-width: 790px;
    padding: 1.5rem;
    border-left: 2px solid rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.025);
}

/* CONTACT */

.contact-section {
    padding: 4rem 2rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    background:
        radial-gradient(
            ellipse at 50% 120%,
            rgba(255, 255, 255, 0.07),
            transparent 65%
        ),
        rgba(255, 255, 255, 0.025);
    text-align: center;
}

.contact-section h2 {
    max-width: 650px;
    margin: 0 auto;
}

.contact-section > p:not(.eyebrow) {
    max-width: 500px;
    margin: 1rem auto 0;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
    line-height: 1.8;
}

.contact-links {
    justify-content: center;
}

/* RESPONSIVE */

@media (max-width: 800px) {
    .hero-section {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding-bottom: 3rem;
    }

    .hero-visual {
        max-width: 500px;
        width: 100%;
        margin: 0 auto;
    }

    .project-card {
        grid-template-columns: 1fr;
    }

    .project-visual {
        max-width: 500px;
        width: 100%;
        margin: 1rem auto 0;
    }
}

@media (max-width: 600px) {
    .about-page {
        padding: 2.5rem 1.2rem 4rem;
    }

    .hero-section {
        min-height: auto;
    }

    .hero-content h1 {
        font-size: clamp(3.3rem, 15vw, 5rem);
    }

    .hero-content h2 {
        font-size: 1.05rem;
    }

    .hero-description {
        font-size: 0.9rem;
    }

    .content-section {
        padding: 3rem 0;
    }

    .tech-grid {
        grid-template-columns: 1fr;
    }

    .tech-card {
        padding: 1.2rem;
    }

    .focus-item {
        grid-template-columns: 35px 1fr 20px;
        gap: 0.6rem;
    }

    .focus-item h3 {
        font-size: 1rem;
    }

    .focus-item p {
        font-size: 0.82rem;
    }

    .project-card {
        padding: 1.2rem;
    }

    .contact-section {
        padding: 3rem 1.2rem;
    }

    .contact-links {
        flex-direction: column;
        align-items: stretch;
    }

    .contact-links a {
        width: 100%;
        box-sizing: border-box;
    }
}
</style>
