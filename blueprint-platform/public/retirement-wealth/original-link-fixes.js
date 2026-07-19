const primaryAction = document.querySelector('.hero-actions .button:not(.secondary)');
const secondaryAction = document.querySelector('.hero-actions .button.secondary');
const crestImage = document.querySelector('.crest-stage img');

if (primaryAction) primaryAction.href = 'https://wattsunified.com/schedule/solutions';
if (secondaryAction) secondaryAction.href = 'https://wattsunified.com/solutions';
if (crestImage) crestImage.src = '/retirement-wealth/assets/watts-unified-logo.png';
