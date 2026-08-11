const fs = require('fs');
const path = require('path');
// Import Ajv version 8+ which separates newer draft environments
const Ajv2020 = require('ajv/dist/2020');

// Create the JSON schema and test files locally if they don't exist
function createSampleFiles() {
  const schema = {
    "$schema": "https://json-schema.org",
    "title": "LibraryCatalogueEntry",
    "type": "object",
    "properties": {
      "isbn": { "type": "string", "pattern": "^[0-9]{13}$" },
      "title": { "type": "string", "minLength": 1 },
      "authors": {
        "type": "array",
        "items": { "type": "string" },
        "minItems": 1
      },
      "year": { "type": "integer", "minimum": 1450, "maximum": 2025 },
      "format": { "type": "string", "enum": ["hardcover", "paperback", "ebook", "audiobook"] },
      "available": { "type": "boolean" }
    },
    "required": ["isbn", "title", "authors", "year", "format"],
    "additionalProperties": false
  };

  const validData = {
    "isbn": "9780141439518",
    "title": "Pride and Prejudice",
    "authors": ["Jane Austen"],
    "year": 1813,
    "format": "paperback",
    "available": true
  };

  const invalidData = {
    "isbn": "12345",
    "title": "",
    "authors": [],
    "year": 1400,
    "format": "hardcover"
  };

  fs.writeFileSync(path.join(__dirname, 'catalogue.schema.json'), JSON.stringify(schema, null, 2));
  fs.writeFileSync(path.join(__dirname, 'valid.json'), JSON.stringify(validData, null, 2));
  fs.writeFileSync(path.join(__dirname, 'invalid.json'), JSON.stringify(invalidData, null, 2));
}

function validateFile(filePath, validateFunction) {
  console.log(`\n--- Validating: ${filePath} ---`);

  if (!fs.existsSync(filePath)) {
    console.log(`Error: ${filePath} not found.`);
    return;
  }

  // Load and parse the payload target file
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const instance = JSON.parse(fileContent);

  // Execute validation rule sets
  const isValid = validateFunction(instance);

  if (isValid) {
    console.log(`Result: PASSED! ${filePath} satisfies all schema rules.`);
  } else {
    console.log(`Result: FAILED! Found ${validateFunction.errors.length} validation error(s):`);
    validateFunction.errors.forEach((err, index) => {
      // Clean up the instance path path readability
      const field = err.instancePath ? err.instancePath.substring(1) : 'root';
      console.log(`  ${index + 1}. Field [${field}]: ${err.message} (${JSON.stringify(err.params)})`);
    });
  }
}

function main() {
  // Ensure the runtime workspace has the target payload mock data files
  createSampleFiles();

  // Instantiate standard 2020-12 environment, instructing it to collect *all* errors
  const ajv = new Ajv2020({ allErrors: true });

  // Read schema definition metadata
  const schemaPath = path.join(__dirname, 'catalogue.schema.json');
  const schemaJson = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  // Compile the schema rules structure into optimized executable checker function
  const validate = ajv.compile(schemaJson);

  // Evaluate structural validity matching across file layers
  validateFile(path.join(__dirname, 'valid.json'), validate);
  validateFile(path.join(__dirname, 'invalid.json'), validate);
}

main();
