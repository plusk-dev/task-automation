import json
from typing import Dict, Any, List, Set


def find_ref_schema(ref_path: str, components: Dict[str, Any]) -> Dict[str, Any]:
    if not ref_path or not ref_path.startswith('#/components/schemas/'):
        return {}
    schema_name = ref_path.split('/')[-1]
    return components.get(schema_name, {})


def convert_schema_to_fields(
    schema: Dict[str, Any],
    components: Dict[str, Any],
    visited_refs: Set[str] = None,
    depth: int = 0,
    max_depth: int = 200
) -> List[Dict[str, Any]]:
    if visited_refs is None:
        visited_refs = set()

    if depth > max_depth:
        print(f"Max depth reached for schema: {schema}")
        return []

    fields = []

    if '$ref' in schema:
        ref_path = schema['$ref']
        if ref_path in visited_refs:
            print(f"Circular reference detected: {ref_path}")
            return []
        visited_refs.add(ref_path)
        schema = find_ref_schema(ref_path, components)
        if not schema:
            print(f"Could not resolve reference: {ref_path}")
            return []

    # Handle different schema types
    schema_type = schema.get('type', 'object')
    
    if schema_type == 'object':
        properties = schema.get('properties', {})
        required = schema.get('required', [])

        for key, prop in properties.items():
            field = {
                'key': key,
                'type': prop.get('type', 'string'),
                'description': prop.get('description', ''),
                'required': key in required,
                'fields': []
            }

            if prop.get('type') == 'object':
                if '$ref' in prop:
                    ref_path = prop['$ref']
                    if ref_path not in visited_refs:
                        visited_refs.add(ref_path)
                        prop = find_ref_schema(ref_path, components)
                field['fields'] = convert_schema_to_fields(
                    prop,
                    components,
                    visited_refs.copy(),
                    depth + 1,
                    max_depth
                )

            # Handle array
            elif prop.get('type') == 'array':
                items = prop.get('items', {})
                if '$ref' in items:
                    ref_path = items['$ref']
                    if ref_path not in visited_refs:
                        visited_refs.add(ref_path)
                        items = find_ref_schema(ref_path, components)
                if items.get('type') == 'object':
                    field['fields'] = convert_schema_to_fields(
                        items,
                        components,
                        visited_refs.copy(),
                        depth + 1,
                        max_depth
                    )

            fields.append(field)
    
    elif schema_type == 'array':
        # Handle array at root level
        items = schema.get('items', {})
        if '$ref' in items:
            ref_path = items['$ref']
            if ref_path not in visited_refs:
                visited_refs.add(ref_path)
                items = find_ref_schema(ref_path, components)
        if items.get('type') == 'object':
            fields = convert_schema_to_fields(
                items,
                components,
                visited_refs.copy(),
                depth + 1,
                max_depth
            )
    
    elif schema_type in ['string', 'number', 'integer', 'boolean']:
        # Handle primitive types
        field = {
            'key': 'value',
            'type': schema_type,
            'description': schema.get('description', ''),
            'required': True,
            'fields': []
        }
        fields.append(field)
    
    else:
        print(f"Unhandled schema type: {schema_type} for schema: {schema}")

    return fields


def process_parameters(parameters: List[Dict[str, Any]]) -> str:
    processed_params = []
    for param in parameters:
        processed_param = {
            'name': param.get('name', ''),
            'in': param.get('in', ''),
            'required': param.get('required', False),
            'schema': param.get('schema', {})
        }
        processed_params.append(processed_param)
    return json.dumps(processed_params)
