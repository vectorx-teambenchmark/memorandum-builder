<script setup>

import { RouterView } from 'vue-router'

</script>

<template>
  <header class="slds-global-header_container">
    <div class="slds-global-header">
      <div class="slds-global-header__item">
        <div>
          <img src="/src/assets/images/logo-color-horiz_small.png" />
          <span class="slds-assistive-text">Benchmark CIM Builder</span>
        </div>
      </div>
    </div>
  </header>
  <div class="top-pad_really-big">
  <RouterView />
  </div>
</template>

<style>
  .top-pad_really-big {
    margin-top: 60px;
  }
</style>