<script setup lang="ts">

import { ref } from "vue"
import { loadGame, saveGame, hardReset, exportSaveString } from "../save"
import { matterionAutomationEnabled, pointupgrepenabled } from "../settings"
import { player } from "../player"
import { isChineseTranslationEnabled, setChineseTranslation } from "../localization"

const chineseEnabled = ref(isChineseTranslationEnabled())
const showLoadPopup = ref(false)
const showExportPopup = ref(false)
const showConfirmReset = ref(false)

const saveInput = ref("")
const exportString = ref("")
const errorMessage = ref("")
const copied = ref(false)

function tryLoadSave() {
  const input = saveInput.value.trim()

  try {
    // Support both Base64 and older plain JSON saves
    try {
      JSON.parse(atob(input))
    } catch {
      JSON.parse(input)
    }

    localStorage.setItem("incrementalSave", input)
    loadGame()

    showLoadPopup.value = false
    errorMessage.value = ""
    saveInput.value = ""
  } catch {
    errorMessage.value = "Invalid save!"
  }
}

function exportSave() {
  try {
    exportString.value = exportSaveString()
    copied.value = false
    showExportPopup.value = true
  } catch {
    exportString.value = ""
    errorMessage.value = "Failed to export save!"
    showExportPopup.value = true
  }
}

async function copyExport() {
  try {
    await navigator.clipboard.writeText(exportString.value)
    copied.value = true
  } catch {
    copied.value = false
    errorMessage.value = "Clipboard access denied. Select and copy the save manually."
  }
}

function downloadExport() {
  const blob = new Blob([exportString.value], {
    type: "text/plain;charset=utf-8"
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = "beyond-the-limits-save.txt"
  link.click()

  URL.revokeObjectURL(url)
}

function confirmHardReset() {
  hardReset()
  showConfirmReset.value = false
}

function toggleMatterionAutomation() {
  matterionAutomationEnabled.value = !matterionAutomationEnabled.value
}

function togglePointUpgradeAutomation() {
  pointupgrepenabled.value = !pointupgrepenabled.value
}

</script>

<template>
  <div class="settings-container">
    <h2 class="settings-title">Settings</h2>
    <button @click="saveGame" class="settings-btn">Save Game</button>
    <button @click="showLoadPopup = true" class="settings-btn">Load Save</button>
    <button @click="exportSave" class="settings-btn">Export Save</button>
    <button @click="showConfirmReset = true" class="settings-btn danger">Hard Reset</button>

    <div class="language-section">
      <h3 class="language-title">Language</h3>
      <button
        @click="setChineseTranslation(true)"
        class="settings-btn language-btn"
        :class="{ active: chineseEnabled }"
      >中文</button>
      <button
        @click="setChineseTranslation(false)"
        class="settings-btn language-btn"
        :class="{ active: !chineseEnabled }"
      >English</button>
    </div>

    <div v-if="showConfirmReset" class="popup-overlay">
      <div class="popup">
        <h3 id="loadingsave">Confirm Hard Reset</h3>
        <p id="stylizing">This will permanently erase your progress. Are you sure?</p>
        <div class="popup-buttons">
          <button @click="confirmHardReset" class="settings-btn danger">Yes, Reset</button>
          <button @click="showConfirmReset = false" class="settings-btn">Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="showLoadPopup" class="popup-overlay">
      <div class="popup">
        <h3 id="loadingsave">Load Save</h3>
        <textarea v-model="saveInput" placeholder="Paste your save code here"></textarea>
        <p v-if="errorMessage" class="error" id="stylizing">{{ errorMessage }}</p>
        <div class="popup-buttons">
          <button @click="tryLoadSave" class="settings-btn">Load</button>
          <button @click="showLoadPopup = false" class="settings-btn danger">Cancel</button>
        </div>
      </div>
    </div>


  </div>

<div v-if="showExportPopup" class="popup-overlay">
  <div class="popup export-popup">
    <h3 id="loadingsave">Export Save</h3>

    <p class="export-description">
      Your save is ready to be exported.
    </p>

    <div class="save-info">
      <span>Save size: </span>
      <span>{{ exportString.length.toLocaleString() }} characters</span>
    </div>

    <textarea
      readonly
      :value="exportString"
      class="export-textarea"
      spellcheck="false"
      @click="($event.target as HTMLTextAreaElement).select()"
    ></textarea>

    <p v-if="errorMessage" class="error">
      {{ errorMessage }}
    </p>

    <p v-if="copied" class="copied-message">
      Save copied successfully!
    </p>

    <div class="popup-buttons export-buttons">
      <button @click="copyExport" class="settings-btn">
        {{ copied ? "Copied!" : "Copy Save" }}
      </button>

      <button @click="downloadExport" class="settings-btn">
        Download
      </button>

      <button
        @click="showExportPopup = false"
        class="settings-btn danger"
      >
        Close
      </button>
    </div>
  </div>
</div>

  <div class="automation-section">
  <h3 class="automation-title">Automation</h3>

  <div v-if="player.fupgrades[1].bought || player.infinity.calamitytier.gte(2)">
    <p class="automation-title">Matterion autobuyer:
      <span v-if="matterionAutomationEnabled" class="enabled">Enabled</span>
      <span v-else class="disabled">Disabled</span>
    </p>
    <button @click="toggleMatterionAutomation" class="settings-btn">
      {{ matterionAutomationEnabled ? "Disable" : "Enable" }}
    </button>
  </div>

  <div v-if="player.gods.god1com">
    <p class="automation-title">Point and point repeatable autobuyer:
      <span v-if="pointupgrepenabled" class="enabled">Enabled</span>
      <span v-else class="disabled">Disabled</span>
    </p>
    <button @click="togglePointUpgradeAutomation" class="settings-btn">
      {{ pointupgrepenabled ? "Disable" : "Enable" }}
    </button>
  </div>
</div>
</template>


<style scoped>

/* MAIN SETTINGS */
.settings-container {
  width: min(90%, 420px);
  margin: 45px auto;
  padding: 25px;
  background: linear-gradient(145deg, #151515, #090909);
  border: 1px solid #66521f;
  border-radius: 12px;
  box-shadow: 0 0 25px #000;
  text-align: center;
}

.settings-title {
  font-family: 'Orbitron', monospace;
  color: #e8c96a;
  letter-spacing: 5px;
  text-transform: uppercase;
  margin-bottom: 25px;
  text-shadow: 0 0 15px #a17b2c;
}

/* BUTTONS */
.settings-btn {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 13px;
  position: relative;
  overflow: hidden;
  background: #101010;
  color: #d9bc68;
  border: 1px solid #725d2c;
  border-radius: 5px;
  font-family: 'Orbitron', monospace;
  font-size: 13px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: 0.25s ease;
}

.settings-btn:hover {
  background: #302817;
  border-color: #e8c96a;
  color: #fff0b0;
  box-shadow: 0 0 15px #8b702b55;
  transform: translateY(-2px);
}

.settings-btn:active {
  transform: scale(0.97);
}

/* LANGUAGE SWITCH */
.language-section {
  margin-top: 22px;
}

.language-title {
  color: #e8c96a;
  font-size: 14px;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.language-btn {
  display: inline-block;
  width: auto;
  min-width: 96px;
  margin: 0 5px;
}

.language-btn.active {
  background: #302817;
  border-color: #e8c96a;
  color: #fff0b0;
  box-shadow: 0 0 15px #8b702b55;
}

/* DANGER BUTTONS */
.settings-btn.danger {
  color: #d94b55;
  border-color: #70252c;
}

.settings-btn.danger:hover {
  background: #321418;
  border-color: crimson;
  color: #ff8b91;
  box-shadow: 0 0 15px #a0003055;
}

.popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
}

.popup {
  width: min(420px, 100%);
  padding: 25px;
  background: linear-gradient(145deg, #171717, #080808);
  border: 1px solid #94752e;
  border-radius: 8px;
  box-shadow: 0 0 35px #000, 0 0 15px #92732b22;
  animation: popup-enter 0.25s ease;
}

@keyframes popup-enter {
  from {
    opacity: 0;
    transform: translateY(15px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

#loadingsave {
  font-family: retro, monospace;
  color: #e8c96a;
  text-shadow: 0 0 12px #b28b35;
  letter-spacing: 2px;
  margin-bottom: 15px;
}

/* TEXT AREAS */
.popup textarea {
  box-sizing: border-box;
  width: 100%;
  height: 110px;
  padding: 12px;
  resize: vertical;
  background: #080808;
  color: #d9bc68;
  border: 1px solid #594923;
  border-radius: 5px;
  font-family: monospace;
  font-size: 12px;
  outline: none;
  transition: 0.2s;
}

.popup textarea:focus {
  border-color: #d9bc68;
  box-shadow: 0 0 10px #d9bc6833;
}

/* EXPORT */
.export-popup {
  width: min(520px, 100%);
}

.export-description {
  color: #888;
  font-family: retro, monospace;
  font-size: 12px;
}

.save-info {
  display: flex;
  justify-content: space-between;
  color: #b99b54;
  font-family: monospace;
  font-size: 11px;
}

.export-textarea {
  height: 150px !important;
  color: #a9d69a !important;
  border-color: #536b40 !important;
  line-height: 1.5;
  overflow-wrap: anywhere;
  word-break: break-all;
}

.export-textarea:focus {
  border-color: #a9d69a !important;
  box-shadow: 0 0 12px #a9d69a33 !important;
}

.copied-message {
  color: #9bdb82;
  font-family: retro, monospace;
  text-shadow: 0 0 8px #75c95c;
}


.popup-buttons {
  display: flex;
  justify-content: space-around;
  gap: 8px;
  margin-top: 15px;
}

.popup-buttons .settings-btn {
  flex: 1;
  margin: 0;
  padding: 11px 5px;
  font-size: 11px;
}

/* ERRORS */
.error,
#stylizing {
  color: #e05260;
  font-family: retro, monospace;
  text-shadow: 0 0 8px #b52235;
  font-size: 12px;
}

/* AUTOMATION */
.automation-section {
  width: min(90%, 420px);
  box-sizing: border-box;
  margin: 30px auto;
  padding: 22px;
  background: #0d0d0d;
  border: 1px solid #594923;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 5px 20px #000;
}

.automation-title {
  font-family: 'Orbitron', monospace;
  color: #c9a94f;
  letter-spacing: 1px;
  margin-bottom: 15px;
}

.enabled,
.disabled {
  display: block;
  margin-top: 8px;
  font-family: retro, monospace;
  text-align: center;
}

.enabled {
  color: #8edb79;
  text-shadow: 0 0 10px #55b93e;
}

.disabled {
  color: #d94b55;
  text-shadow: 0 0 10px #b52235;
}

/* SMALL SCREENS */
@media (max-width: 500px) {
  .settings-container,
  .automation-section {
    width: 95%;
  }

  .popup {
    padding: 18px;
  }

  .popup-buttons .settings-btn {
    font-size: 10px;
  }
}

</style>