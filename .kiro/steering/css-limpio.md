# CSS Clean Code Rules

Every time CSS is modified in this project, the following checks MUST be performed before considering the task complete:

## Post-modification checklist

1. **No duplicate rules** — Verify the selector being modified/added doesn't already exist elsewhere in the same file. If it does, merge them into one.

2. **Remove replaced rules** — When a CSS property or rule is updated, delete the old version entirely. Never leave both old and new versions coexisting.

3. **Sync HTML ↔ CSS class names** — If a class name changes in the HTML, update ALL references in CSS files immediately. If a class is removed from HTML, remove its CSS rules too.

4. **No orphaned selectors** — After any structural HTML change, verify that CSS selectors still match existing elements. Remove any rule that targets a class/element no longer in the DOM.

5. **No contradicting overrides** — If a responsive breakpoint overrides a property that no longer exists in the base rule (because the base changed), remove the override.

6. **Clean comments** — Remove comments that reference removed features (e.g., "placeholder styles" after placeholders were replaced with images).

## When renaming a class

- Search all `.css` files for the old class name
- Search all `.js` files for the old class name (querySelector, classList, etc.)
- Replace in all locations simultaneously
- Verify no orphans remain

## When removing an HTML element

- Search all CSS files for selectors targeting that element's classes
- Remove those CSS rules
- Check if any JS references that class (event listeners, animations)
- Remove JS references too
