# CSV Data Structure for Tsubaki Inventory App

## File: `demo-data.csv`

This CSV contains sample data that matches the app's data models. You can modify this file to add your own demo data.

## Column Descriptions

### Order Information
- **order_id**: Unique identifier for the order (e.g., "po_001")
- **order_number**: Human-readable order number (e.g., "ORD-001")
- **store_name**: Name of the store/supplier
- **store_location**: Location of the store (e.g., "Austin TX")
- **created_at**: Unix timestamp in milliseconds
- **order_status**: Computed status of the entire order
  - `READY_FOR_PICKUP`
  - `PICKED_UP`
  - `READY_FOR_RETURN`
  - `RETURNED`

### Item Information
- **item_id**: Unique identifier for the part item (e.g., "poi_1")
- **part_number**: SKU/part number (e.g., "BP-1234")
- **item_name**: Human-readable name of the part
- **units**: Quantity of the part
- **item_status**: Current status of the individual item
  - `READY_FOR_PICKUP`
  - `PICKED_UP`
  - `READY_FOR_RETURN`
  - `RETURNED`
- **job_id**: Associated job identifier (e.g., "j1")

## Status Rules

### Order Status Computation
The order status is automatically computed based on item statuses:
- If **any** item is `READY_FOR_PICKUP` → order `READY_FOR_PICKUP`
- Else if **all** items are `PICKED_UP` → order `PICKED_UP`
- Else if **any** item is `READY_FOR_RETURN` → order `READY_FOR_RETURN`
- Else if **all** items are `RETURNED` → order `RETURNED`

### Item Status Flow
1. **READY_FOR_PICKUP** → Item is ready to be picked up
2. **PICKED_UP** → Item has been picked up (after photo capture)
3. **READY_FOR_RETURN** → Item is ready to be returned
4. **RETURNED** → Item has been returned (after photo capture)

## Sample Data Notes

- **Multiple items per order**: Each row represents one item, so orders with multiple items will have multiple rows
- **Timestamps**: Use Unix timestamps in milliseconds (e.g., 1695019200000)
- **Job IDs**: Use simple identifiers like "j1", "j2", etc.
- **Part Numbers**: Use your actual SKU format (e.g., "BP-1234", "RT-8899")

## Adding Your Own Data

1. **Copy the CSV structure** above
2. **Replace the sample data** with your own:
   - Store names and locations
   - Part numbers and names
   - Job IDs
   - Quantities
3. **Maintain the same column order** and data types
4. **Ensure unique IDs** for orders and items
5. **Follow the status rules** for realistic demo scenarios

## Demo Scenarios

The sample data includes various scenarios:
- **Mixed statuses**: Orders with items in different states
- **Multiple stores**: Different suppliers and locations
- **Various quantities**: Different unit counts
- **Realistic part names**: Brake-related parts for automotive context

You can modify these to match your specific industry or use case!
