<script setup>
import { computed } from 'vue';

const props = defineProps({
    label :{
        type: String,
        required: true
    },
    activeLabel: {
        type: String,
        default() {
            return 'Enabled';
        }
    },
    inactiveLabel: {
        type: String,
        default(){
            return 'Disabled';
        }
    },
    modelValue: {
        type: Boolean,
        default(){
            return false;
        }
    }
});
const emit = defineEmits(['update:modelValue','change']);

const value = computed({
    get(){
        return props.modelValue;
    },
    set(value){
        emit('update:modelValue',value);
    }
});


</script>

<template>
    <div class="slds-form-element">
        <label class="slds-checkbox_toggle slds-grid">
            <span class="slds-form-element__label slds-m-bottom_none">{{ props.label }}</span>
            <input type="checkbox" name="checkbox-toggle" v-model="value" aria-describedby="checkbox-toggle" v-on:change="emit('change')" />
            <span id="checkbox-toggle" class="slds-checkbox_faux_container">
                <span class="slds-checkbox_faux"></span>
                <span class="slds-checkbox_on">{{ props.activeLabel }}</span>
                <span class="slds-checkbox_off">{{ props.inactiveLabel }}</span>
            </span>
        </label>
    </div>
</template>