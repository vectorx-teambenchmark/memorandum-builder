<script setup>
    const props = defineProps({
        versionInfo:{
            type: Object,
            default(){
                return { VersionName__c:'N/A'}
            }
        }
    })
</script>

<template>
    <div class="slds-page-header">
        <div class="slds-page-header__row">
            <div class="slds-page-header__col-title">
                <div class="slds-media">
                    <div class="slds-media__figure">

                    </div>
                    <div class="slds-media__body">
                        <div class="slds-page-header__name">
                            <div class="slds-page-header__name-title">
                                <h1><span class="slds-page-header__title">{{ props.versionInfo.VersionName__c }}</span></h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="slds-page-header__col-actions">

            </div>
        </div>
    </div>
</template>