import json
import os
from jsonschema import Draft202012Validator, exceptions


def create_sample_files():
    """Helper function to create the schema and data files locally."""
    schema = {
        "title": "LibraryCatalogueEntry",
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            "title": {"type": "string", "minLength": 1},
            "authors": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": 1,
            },
            "year": {"type": "integer", "minimum": 1450, "maximum": 2025},
            "format": {
                "type": "string",
                "enum": ["hardcover", "paperback", "ebook", "audiobook"],
            },
            "available": {"type": "boolean"},
        },
        "required": ["isbn", "title", "authors", "year", "format"],
        "additionalProperties": False,
    }

    valid_data = {
        "isbn": "9780141439518",
        "title": "Pride and Prejudice",
        "authors": ["Jane Austen"],
        "year": 1813,
        "format": "paperback",
        "available": True,
    }

    invalid_data = {
        "isbn": "12345",
        "title": "",
        "authors": [],
        "year": 1400,
        "format": "hardcover",
    }

    with open("catalogue.schema.json", "w") as f:
        json.dump(schema, f, indent=2)
    with open("valid.json", "w") as f:
        json.dump(valid_data, f, indent=2)
    with open("invalid.json", "w") as f:
        json.dump(invalid_data, f, indent=2)


def validate_file(file_path, validator):
    print(f"\n--- Validating: {file_path} ---")

    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    with open(file_path, "r") as f:
        instance = json.load(f)

    # Collect all validation errors instead of stopping at the first one
    errors = list(validator.iter_errors(instance))

    if not errors:
        print(f"Result: PASSED! {file_path} satisfies all schema rules.")
    else:
        print(f"Result: FAILED! Found {len(errors)} validation error(s):")
        for idx, error in enumerate(errors, 1):
            path = " -> ".join([str(p) for p in error.path]) or "root"
            print(f"  {idx}. Field [{path}]: {error.message}")


if __name__ == "__main__":
    # Ensure files exist for this standalone example run
    create_sample_files()

    # Load the JSON Schema file
    with open("catalogue.schema.json", "r") as f:
        schema_json = json.load(f)

    # Initialize the validator using the proper Draft 2020-12 specification
    validator = Draft202012Validator(schema_json)

    # Validate both payload files
    validate_file("valid.json", validator)
    validate_file("invalid.json", validator)
