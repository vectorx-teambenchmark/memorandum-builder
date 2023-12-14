<script setup>
    import { computed, reactive } from 'vue';
    //component properties
    const props = defineProps({
        label: {
            type: String,
            required: true
        },
        placeholder: {
            type: String,
            required: true
        },
        options: {
            type: Array
        },
        modelValue: {
            type: String
        }
    });
    //component events emitted
    const emit = defineEmits(['update:modelValue','selection']);
    
    const value = computed({
        get(){
            return props.modelValue
        },
       set(value) {
        emit('update:modelValue',value)
       }
    });

    const hasListboxValue = computed(()=>{
        return Array.isArray(props.options) && props.options.length > 0;
    });

    const selectedVal = reactive({});

    function handleSelection(id){
        window.console.log('Selection happened. %s', id);
        selectedVal.detail = props.options.find( element => element.value === id);
        emit('selection',selectedVal);
    }
    function clearSelection(){
        selectedVal.detail = undefined;
    }
</script>

<template>
    <div class="slds-form-element">
        <label class="slds-form-element__label" for="combobox-im-selector" id="combobox-label-im-selector">
            {{props.label}}
        </label>
        <div class="slds-form-element__control">
            <div class="slds-combobox_container">
                <div v-bind:class="{ 'slds-combobox':true, 'slds-dropdown-trigger':true, 'slds-dropdown-trigger_click':true, 'slds-is-open':(hasListboxValue && selectedVal?.detail === undefined) }">
                    <div class="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">

                        <input v-if="selectedVal?.detail === undefined" v-model="value" type="text" class="slds-input slds-combobox__input" id="combobox-im-selector"
                            aria-auutocomplete="list" aria-controls="listbox-im-list" v-bind:aria-expanded="(hasListboxValue && selectedVal?.detail === undefined)"
                            aria-haspopup="listbox" autoComplete="off" role="combobox" v-bind:placeholder="props.placeholder" />
                        <span v-if="selectedVal?.detail === undefined" 
                            class="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_right">
                            <svg class="slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true">
                                <use xlink:href="/src/assets/icons/utility-sprint/svg/symbols.svg#search"></use>
                            </svg>
                        </span>

                        <div v-if="selectedVal?.detail !== undefined" role="combobox" tabindex="0" class="slds-input_faux slds-combobox__input slds-combobox__input-value" id="listbox-im-selector"
                            aria-controls="listbox-im-list" v-bind:aria-expanded="(hasListboxValue && selectedVal?.detail === undefined)"
                            aria-haspopup="listbox">
                            <span class="slds-truncate" id="combobox-selected-value">{{ selectedVal.detail.label }}</span>
                        </div>
                        <button v-if="selectedVal?.detail !== undefined" class="slds-button slds-button_icon slds-input__icon slds-input__icon_right" 
                            title="Clear the text input" v-on:click="clearSelection()">
                            <svg class="slds-button__icon" aria-hidden="true">
                                <use xlink:href="/src/assets/icons/utility-sprite/svg/symbols.svg#clear"></use>
                            </svg>
                            <span class="slds-assistive-text">Clear the text input</span>
                        </button>

                    </div>

                    <div id="listbox-im-list" class="slds-dropdown slds-dropdown_length-5 slds-dropdown_fluid" 
                            aria-label="Placeholder for Dropdown Items" role="listbox" tabindex="0" aria-busy="false">
                        <ul class="slds-listbox slds-listbox_vertical" role="presentation" 
                            aria-label="Placeholder for Dropdown Items">

                            <li v-for="selection in props.options" role="presentation" v-bind:key="selection.value" 
                                class="slds-listbox__item" v-on:click="handleSelection(selection.value)">
                                <div v-bind:id="selection.value" class="slds-media slds-listbox__option slds-listbox__option_plain slds-media_small" role="option">
                                    <span class="slds-media__figure slds-listbox__option-icon"></span>
                                    <span class="slds-media__body">
                                        <span class="slds-truncate" title="selection.label">{{ selection.label }}</span>
                                    </span>
                                </div>
                            </li>

                        </ul>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>