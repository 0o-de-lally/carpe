<script>
  import { onDestroy, onMount } from 'svelte'
  import { link } from 'svelte-spa-router'
  
  import { makeWhole } from '../../modules/accounts'
  import { updateMakeWhole } from '../../modules/accountActions'

  let totalCredits = 0
  let isDisplayed = false

  onMount(() => {
    updateMakeWhole()
    makeWhole.subscribe((m) => {
      totalCredits = 0
      Object.keys(m).forEach((account) => {
        m[account]
          .filter((item) => !item.claimed)
          .forEach((item) => {
            totalCredits += item.coins / 1000000
          })
      })
      isDisplayed = totalCredits > 0
    })
  })

  onDestroy(async () => {
    // No need to unsubscribe from makeWhole as it's handled by the onMount lifecycle
  })
</script>

{#if isDisplayed}
  <a href="/make-whole" use:link>{totalCredits} coins</a>
{/if}
