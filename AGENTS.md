# AI Developer Rules and Pending Tasks

## Pending Tasks (To be executed when developer quota resets)

### 1. Character Image Generation
- **Target**: Generate a high-quality character avatar portrait for the family of scenario characters (OL / Female Boss / female office worker).
- **Prompt**: `A high quality anime-style character portrait of a long-haired young female office worker (OL) with a round, cute face, solid white or gray background. Bust up.`
- **Reason**: The image generation tool encountered a `resource_exhausted` (quota limit exceeded) error today (June 21, 2026). This must be rerun tomorrow once the daily quota is reset.
- **After Generation**: Save the resulting asset and configure it as needed in `/src/data/scenarios.ts` to replace the temporary Unsplash avatar URL references or placeholder avatar variables.

## User Rules

### Image Generation Rules for Settings/Scenarios
When generating character or scene illustrations, you MUST AT ALL TIMES follow these rules:
1. **Style Consistency**: Generate illustrations with a style that closely matches the existing UI and existing image assets.
2. **Quota Awareness**: Always be mindful of quota limits (rate limits) when using the image generation tool. Avoid excessive generations in short periods.
3. **Portrait Framing**: Unless the user specifies otherwise, character portraits MUST be strictly "bust up" (from the chest up) for consistency.
