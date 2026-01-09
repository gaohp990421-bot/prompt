<template>
    <div class="relative w-full h-full flex flex-col min-h-0 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all overflow-hidden cursor-text"
        @click="focusTextarea">

        <!-- Scroll Container (Shared) -->
        <div class="relative flex-1 w-full h-full min-h-0 overflow-hidden">

            <!-- Backdrop (Highlighter) -->
            <!-- Note: pointer-events-none ensures clicks go through to textarea -->
            <!-- text-transparent for non-highlighted parts? No, the textarea is transparent. -->
            <div ref="backdropRef"
                class="absolute inset-0 w-full h-full p-3 m-0 font-mono text-sm leading-6 whitespace-pre-wrap break-words overflow-hidden pointer-events-none z-0"
                :class="[isFocused ? 'border-transparent' : 'border-transparent']" aria-hidden="true">
                <span v-for="(token, index) in tokens" :key="index" :class="token.class">{{ token.text }}</span>
                <!-- Extra newline helps align scroll at bottom -->
                <br />
            </div>

            <!-- Textarea (Input) -->
            <!-- text-transparent to hide raw text, caret-color to show cursor -->
            <textarea ref="textareaRef" :value="modelValue" @input="handleInput" @scroll="syncScroll"
                class="absolute inset-0 w-full h-full p-3 m-0 font-mono text-sm leading-6 whitespace-pre-wrap break-words bg-transparent text-transparent caret-gray-900 dark:caret-white border-none outline-none resize-none z-10 overflow-auto custom-scrollbar"
                spellcheck="false" :placeholder="placeholder"></textarea>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'

const props = defineProps<{
    modelValue: string
    placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const backdropRef = ref<HTMLDivElement | null>(null)
const isFocused = ref(false)

// Tokenize logic
const tokens = computed(() => {
    const text = props.modelValue || ''
    // Regex to match {{ ... }}
    const regex = /(\{\{.*?\}\})/g
    const parts = text.split(regex)

    return parts.map(part => {
        if (regex.test(part)) {
            // It's a variable
            return {
                text: part,
                class: 'text-amber-500 font-bold bg-amber-500/10 rounded-[2px] mx-[1px] inline-block'
            }
        }
        return {
            // Normal text
            // Must explicitly set color because textarea is transparent. 
            // We want text to look like normal input text.
            text: part,
            class: 'text-gray-900 dark:text-gray-100'
        }
    })
})

const handleInput = (e: Event) => {
    const val = (e.target as HTMLTextAreaElement).value
    emit('update:modelValue', val)
    nextTick(syncScroll)
}

const syncScroll = () => {
    if (textareaRef.value && backdropRef.value) {
        backdropRef.value.scrollTop = textareaRef.value.scrollTop
        backdropRef.value.scrollLeft = textareaRef.value.scrollLeft
    }
}

const focusTextarea = () => {
    textareaRef.value?.focus()
    isFocused.value = true
}

// Watch model value to sync scroll if content changes externally
watch(() => props.modelValue, () => {
    nextTick(syncScroll)
})

</script>

<style scoped>
/* Ensure font consistency perfectly */
textarea,
div {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

/* Custom Scrollbar for Textarea */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.8);
}
</style>
