# Remove Model Search Design

## Goal

Simplify the screen-selection step by removing the redundant **Find a model** search field while preserving the existing Brand, Device, and Custom dimensions workflows.

## User experience

The screen-selection section will contain two preset controls:

1. **Brand** selects a manufacturer.
2. **Device** lists the presets available for that manufacturer.

Selecting a brand will continue to choose that brand's first device automatically. Selecting a device will continue to apply its width, height, display name, crop aspect ratio, and export filename. Choosing **Custom** from either supported custom entry point will continue to enable the width and height fields.

The **Find a model** search input and its browser datalist will no longer appear. No replacement search control will be added.

## Implementation boundaries

Remove the model-search input and datalist from `ereader-image-converter.html`, along with their cached DOM references, option-population loop, and input listener.

Remove `findPresetBySearchName` from `web/image-processing.js` and its embedded standalone copy because it has no remaining caller. Keep each preset's `searchNames` data because the first canonical name is still used for device naming and exported filenames. Regenerate the embedded processing module with the existing synchronization script rather than editing both copies independently.

Do not alter the preset catalog, dimensions, manufacturer sources, image-processing pipeline, crop behavior, or visual styling beyond the layout naturally closing the removed field's space.

## Validation and error behavior

Brand and Device changes retain their current validation behavior. Custom dimensions continue to use the existing positive-integer validation and inline error messaging. Removing search introduces no new error state because partial or unmatched model text can no longer be entered.

## Testing

Update unit coverage so `findPresetBySearchName` is no longer part of the exported processing contract and remove its alias-resolution test.

Update browser smoke coverage to verify that:

- the model-search input and datalist are absent;
- selecting a brand filters the Device dropdown;
- selecting a device applies its exact target dimensions;
- Custom dimensions remain selectable and editable;
- existing crop, preview, and export workflows continue to pass.

Run the standalone synchronization check and the full `npm test` suite after implementation.
