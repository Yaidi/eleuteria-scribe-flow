# Project Mocks

This directory contains mock data for the project interfaces defined in the `src/types` directory.

## Available Mocks

### Character Mocks
- `mockCharacters`: An array of character objects that implement the `ICharacter` interface.

### Plot Mocks
- `mockPlots`: An array of plot objects that implement the `IPlot` interface.

### World Mocks
- `mockWorld`: An array of world-building elements that implement the `IWorld` interface.

### General Information Mocks
- `mockGeneral`: An object that implements the `IGeneral` interface with basic project information.

### Chapter Mocks
- `mockChapters`: An array of chapter objects that implement the `IChapter` interface.

### Project Mocks
- `mockProject`: A basic project object that implements the `IProject` interface.
- `mockProjectSections`: An object that implements the `ProjectSections` interface.
- `mockProjectData`: A complete project data object that implements the `ProjectData` interface.
- `mockPartialProjectData`: A partial project data object that implements the `ProjectData` interface with only some sections filled.

## Usage

Import the mocks from the mocks directory:

```typescript
// Import specific mocks
import { mockCharacters, mockPlots } from '@/mocks';

// Or import all mocks
import * as mocks from '@/mocks';
```

Example usage:

```typescript
// Use mock characters in a component
function CharacterList() {
  // In a real application, this would come from an API or store
  const characters = mockCharacters;
  
  return (
    <div>
      {characters.map(character => (
        <div key={character.id}>
          <h2>{character.name}</h2>
          <p>Importance: {character.importance}</p>
          <p>{character.about}</p>
        </div>
      ))}
    </div>
  );
}
```