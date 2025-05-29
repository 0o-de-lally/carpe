<script>
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { link } from 'svelte-spa-router'

  import { app_version } from '../../modules/version'

  let appVersion = {}
  onMount(async () => {
    app_version.subscribe((v) => (appVersion = v))
  })
</script>

<a href="/about" use:link class="uk-text-muted">{$_('about.about')} - v{appVersion.version}</a>
