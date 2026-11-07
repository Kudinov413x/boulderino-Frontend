<script setup lang="ts">

import { ref } from 'vue'

interface Props {
    image: string
}

const props = defineProps<Props>()

const animationFinished = ref(false)

function handleAnimationFinished() {
    animationFinished.value = true
}

</script>

<template>

    <section
        class="icarus-intro"
        :class="{ 'animation-finished': animationFinished }"
    >

        <div
            class="icarus-piece icarus-left"
            :style="{ backgroundImage: `url(${props.image})` }"
        ></div>

        <div
            class="icarus-piece icarus-center"
            :style="{ backgroundImage: `url(${props.image})` }"
        ></div>

        <div
            class="icarus-piece icarus-right"
            :style="{ backgroundImage: `url(${props.image})` }"
            @animationend="handleAnimationFinished"
        ></div>

        <div
            class="intro-content"
            :class="{ visible: animationFinished }"
        >
            <slot />
        </div>

    </section>

</template>

<style scoped>

.icarus-intro {
    position: relative;
    width: 100%;
    min-height: 100vh;
    overflow: hidden;
    background: #000;
}


/* ---------------------------------
BILDTEILE
--------------------------------- */

.icarus-piece {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;

    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;

    will-change: transform, filter;

    filter: opacity(1);
    transition: filter 1.2s ease;
}
.icarus-left,
.icarus-right {
    opacity: 0;
}


/* Nach der Animation:
   Bild etwas entsättigen */

.icarus-intro.animation-finished .icarus-piece {
    filter: opacity(0.35);
}


/* ---------------------------------
LINKER TEIL
--------------------------------- */

.icarus-left {
    z-index:1;
    clip-path: inset(
        0
        66.6667%
        0
        0
    );

    animation:
        slide-left
        1.4s
        cubic-bezier(0.22, 1, 0.36, 1)
        1.1s
        both;
}


/* ---------------------------------
MITTLERER TEIL
--------------------------------- */

.icarus-center {
    z-index: 2;
    clip-path: inset(
        0
        33.3333%
        0
        33.3333%
    );

    animation:
        drop-center
        1.1s
        cubic-bezier(0.22, 1, 0.36, 1)
        0s
        both;
}


/* ---------------------------------
RECHTER TEIL
--------------------------------- */

.icarus-right {
    z-index: 1;

    clip-path: inset(
        0
        0
        0
        66.6667%
    );

    animation:
        slide-right
        1.4s
        cubic-bezier(0.22, 1, 0.36, 1)
        1.1s
        both;
}


/* ---------------------------------
ANIMATIONEN
--------------------------------- */

@keyframes drop-center {

    from {
        transform: translateY(-100vh);
    }

    to {
        transform: translateY(0);
    }

}


/*
 * Die äußeren Teile starten
 * in der Mitte und bewegen sich
 * nach außen.
 */

@keyframes slide-left {
    0% {
        opacity: 0;
        transform: translateX(33.3333%);
    }

    100% {
        opacity: 1;
        transform: translateX(0);
    }
}


@keyframes slide-right {
    0% {
        opacity: 0;
        transform: translateX(-33.3333%);
    }

    100% {
        opacity: 1;
        transform: translateX(0);
    }
}


/* ---------------------------------
CONTENT
--------------------------------- */

.intro-content {
    position: relative;

    z-index: 10;

    min-height: 100vh;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 2rem;

    opacity: 0;

    transition:
        opacity 0.8s ease;

    pointer-events: none;

    z-index: 10
}


.intro-content.visible {
    opacity: 1;
    pointer-events: auto;
}


/* ---------------------------------
ACCESSIBILITY
--------------------------------- */

@media (prefers-reduced-motion: reduce) {

    .icarus-piece {
        animation: none;
        transform: none;
        filter: saturate(0.4);
    }

    .intro-content {
        opacity: 1;
        pointer-events: auto;
    }

}

</style>