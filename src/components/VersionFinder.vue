<script setup>
</script>

<template>
    <div class="slds-box slds-theme_default">
        <div class="slds-form-element">
            <label class="slds-form-element__label" for="combobox-version" id="combobox-version-label">Search Versions</label>
            <div class="slds-form-element__control">
                <div class="slds-combobox_container">
                    <div class="slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click">
                        <div class="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                            <input type="text" id="combobox-version" class="slds-input slds-combobox__input" 
                                aria-autocomplete="list" aria-controls="listbox-container" aria-expanded="false"
                                aria-haspopup="listbox" autoComplete="off" role="combobox" placeholder="Search..." />
                            <span class="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_right">
                                <svg class="slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true">
                                    <use xlink:href="/src/assets/icons/utility-sprite/svg/symbols.svg#search"></use>
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>