# Pokemon MCP Server

A learning project to understand the creation of an MCP (Model Context Protocol) server. This server provides Pokemon information through a simple tool that fetches data from the PokéAPI.

## What is MCP?

MCP (Model Context Protocol) is a protocol that allows AI assistants to connect to external data sources and tools. This project demonstrates how to create a custom MCP server that provides Pokemon information as a tool that can be used by AI assistants.

## Features

- **Pokemon Lookup Tool**: Get detailed information about any Pokemon including:
  - Pokemon ID and name
  - Type(s)
  - Height and weight
  - Formatted display

- **Error Handling**: Proper error handling for invalid Pokemon names and API failures
- **Type Safety**: Uses Zod for schema validation and TypeScript for type safety

## Project Structure

```
├── src/
│   └── server.ts          # Main MCP server implementation
├── dist/                  # Compiled JavaScript output
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

### Running the Server

You can run the server in several ways:

**Development mode (with TypeScript):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**Build and watch for changes:**
```bash
npm run build:watch
```

### Testing with MCP Inspector

To test the server interactively, use the MCP Inspector:

```bash
npm run inspect
```

This will start the MCP Inspector which allows you to test the Pokemon lookup tool.

### Available Tools

The server provides one tool:

- **`get_pokemon_pokedex_info`**: Get information about a Pokemon
  - **Parameter**: `name` (string) - The name of the Pokemon to look up
  - **Returns**: Formatted Pokemon information including ID, types, height, and weight

### Example Usage

When connected to an MCP client, you can use the tool like this:

```
Tool: get_pokemon_pokedex_info
Parameters: { "name": "pikachu" }
```

Response:
```
Pikachu (#25) - Electric type, 0.4m tall, 6kg
```

## Technical Details

### Dependencies

- **`@modelcontextprotocol/sdk`**: Core MCP SDK for building servers
- **`zod`**: Schema validation and type inference
- **`typescript`**: Type safety and modern JavaScript features

### Key Components

1. **Pokemon Schema**: Uses Zod to validate Pokemon data from the PokéAPI
2. **Tool Registration**: Registers the Pokemon lookup tool with the MCP server
3. **Error Handling**: Comprehensive error handling for API failures and invalid inputs
4. **Data Formatting**: Formats Pokemon data into a readable string format

### API Integration

The server integrates with the [PokéAPI](https://pokeapi.co/) to fetch Pokemon information. It handles:
- Pokemon name normalization (converts to lowercase, replaces spaces with hyphens)
- HTTP error handling
- Data validation using Zod schemas

## Learning Objectives

This project demonstrates:

1. **MCP Server Creation**: How to create a custom MCP server from scratch
2. **Tool Registration**: How to register tools that AI assistants can use
3. **External API Integration**: How to fetch and process data from external APIs
4. **Type Safety**: Using TypeScript and Zod for robust data handling
5. **Error Handling**: Proper error handling patterns for production code
6. **Schema Validation**: Using Zod for runtime type checking

## Development

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run build:watch`: Watch for changes and rebuild automatically
- `npm run dev`: Run the server in development mode with TypeScript
- `npm run inspect`: Start the MCP Inspector for testing
- `npm start`: Run the compiled server

### Requirements

- Node.js >= 22.0.0
- npm or yarn

## License

ISC

## Contributing

This is a learning project, but feel free to fork and experiment with it!
