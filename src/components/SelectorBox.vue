<script setup>
    import { computed, ref } from 'vue';
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
    const emit = defineEmits(['selection']);
    const showListbox = ref(false);
    const selectedItem = ref({});
    const selectionMade = computed(()=>{
        return selectedItem.value?.value !== undefined;
    });

    function handleDisplayOptions(){
        showListbox.value = true;
    }
    function handleCloseListbox(){
        showListbox.value = false;
    }
    function handleSelection(selectionValue){
        let selection = props.options.find( option => option.value === selectionValue );
        selectedItem.value = selection;
        emit('selection',{detail:{selection}});
        handleCloseListbox();
    }
</script>

<template>
    <div class="slds-form-element">
        <label class="slds-form-element__label" for="combobox-id-66" id="combobox-label-id-261">{{props.label}}</label>
        <div class="slds-form-element__control">
            <div class="slds-combobox_container">
                <div v-bind:class="{'slds-combobox':true, 'slds-dropdown-trigger':true, 'slds-dropdown-trigger_click':true, 
                    'slds-is-open':showListbox }">
                    
                    <div class="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                        <button role="combobox" tabindex="0" class="slds-input_faux slds-combobox__input"
                            aria-labelledby="combobox-label-id-261 combobox-id-66-selected-value"
                            id="combobox-id-66-selected-value" aria-controls="listbox-id-53" v-bind:aria-expanded="showListbox"
                            aria-haspopup="listbox" v-on:click="handleDisplayOptions">
                            <span v-if="!selectionMade" class="slds-truncate" id="combobox-value-id-189">{{ props.placeholder }}</span>
                            <span v-else class="slds-truncate" id="combobox-value-if-189">{{ selectedItem.label }}</span>
                        </button>
                        <span class="slds-icon_container slds-icon-utility-down slds-input__icon slds-input__icon_right">
                            <svg class="slds-icon slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true">
                                <use xlink:href="/src/assets/icons/utility-sprite/svg/symbols.svg#down"></use>
                            </svg>
                        </span>
                    </div>

                    <div id="listbox-id-53" class="slds-dropdown slds-dropdown_length-5 slds-dropdown_fluid" role="listbox"
                        aria-label="{{Placeholder for Dropdown Items}}" tabindex="0" aria-busy="false">
                        <ul class="slds-listbox slds-listbox_vertical" role="presentation">

                            <li v-for="option in props.options" role="presentation" class="slds-listbox__item" 
                                v-bind:key="option.value" v-on:click="handleSelection(option.value)">
                                <div v-bind:id="option.value"
                                    class="slds-media slds-listbox__option slds-listbox__option_plain slds-media_small"
                                    role="option">
                                    <span class="slds-media__figure slds-listbox__option-icon"></span>
                                    <span class="slds-media__body">
                                        <span class="slds-truncate" v-bind:title="option.label">{{ option.label }}</span>
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