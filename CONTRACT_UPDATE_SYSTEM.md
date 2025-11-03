# Contract Update System Documentation

## Overview

This system automatically updates Contract entities when specific Requirements are marked as fulfilled. This is achieved through a flexible `ContractUpdateAction` field on the Requirement model.

## How It Works

1. **Requirement Configuration**: Requirements can have a `ContractUpdateAction` field that specifies what contract field should be updated when the requirement is fulfilled.

2. **Automatic Updates**: When a requirement fulfillment is marked as `IsFulfilled = true` via the `FulfillmentService`, the system checks for any associated contract update actions.

3. **Contract Matching**: The system finds the contract associated with the negotiation by matching `PerformerId` and `EventId`.

4. **Field Updates**: Based on the `ContractUpdateAction` value, specific contract fields are updated automatically.

## Available Contract Update Actions

| Action | Contract Field Updated | Description |
|--------|----------------------|-------------|
| `UPDATE_DEPOSIT_PAID` | `IsDepositPaid = true` | Marks the deposit as paid |
| `UPDATE_FINAL_PAYMENT_PAID` | `IsFinalPaymentPaid = true` | Marks the final payment as paid |
| `UPDATE_STAKEHOLDER_REVIEW` | `ReviewedByStakeholders = true`, `StakeholderReviewDate = DateTime.UtcNow` | Marks stakeholder review as complete |
| `UPDATE_CONTRACT_SIGNED` | `SignedAt = DateTime.UtcNow`, `Status = "Signed"` | Marks contract as signed |
| `UPDATE_FINAL_VERSION` | `FinalVersionDate = DateTime.UtcNow`, `Status = "Final"` | Marks contract version as final |

## Database Schema Changes

### Requirement Table
A new nullable column `ContractUpdateAction` has been added:

```sql
ALTER TABLE Requirements 
ADD COLUMN ContractUpdateAction VARCHAR(255) NULL;
```

## Usage Examples

### 1. Setting Up a Requirement with Contract Update Action

```csharp
// Example: Create a requirement that triggers deposit payment update
var requirement = new Requirement
{
    Title = "Deposit Payment Confirmation",
    Description = "Confirm that the performance deposit has been received",
    IsRequired = true,
    PhaseId = 3, // Contract Negotiations phase
    ContractUpdateAction = "UPDATE_DEPOSIT_PAID"
};
```

### 2. Using the FulfillmentService

```csharp
// Inject the service
private readonly IFulfillmentService _fulfillmentService;

// Update a fulfillment - this will automatically update the contract if configured
var result = await _fulfillmentService.UpdateFulfillmentStatusAsync(
    fulfillmentId: 123,
    isFulfilled: true,
    fulfilledBy: "john.doe@company.com"
);
```

### 3. API Usage

```bash
# Update a fulfillment status via REST API
PUT /api/fulfillment/123/status
Content-Type: application/json

{
    "isFulfilled": true,
    "fulfilledBy": "john.doe@company.com"
}
```

### 4. Multiple Fulfillments Update

```csharp
// Update multiple fulfillments in a single transaction
var updates = new[]
{
    (FulfillmentId: 123, IsFulfilled: true, FulfilledBy: "user1@company.com"),
    (FulfillmentId: 124, IsFulfilled: true, FulfilledBy: "user2@company.com")
};

var result = await _fulfillmentService.UpdateMultipleFulfillmentStatusAsync(updates);
```

## Configuration Examples by Phase

### Phase 3: Contract Negotiations
- **Deposit Confirmation**: `ContractUpdateAction = "UPDATE_DEPOSIT_PAID"`
- **Initial Review Complete**: `ContractUpdateAction = "UPDATE_STAKEHOLDER_REVIEW"`

### Phase 4: Contract Draft  
- **Final Review Approval**: `ContractUpdateAction = "UPDATE_STAKEHOLDER_REVIEW"`
- **Contract Signature**: `ContractUpdateAction = "UPDATE_CONTRACT_SIGNED"`

### Phase 5: Final Agreement
- **Final Payment Received**: `ContractUpdateAction = "UPDATE_FINAL_PAYMENT_PAID"`
- **Contract Finalization**: `ContractUpdateAction = "UPDATE_FINAL_VERSION"`

## Error Handling

The system includes comprehensive error handling:

1. **Transaction Safety**: All updates are wrapped in database transactions
2. **Logging**: Actions are logged to the console for debugging
3. **Graceful Degradation**: If no contract is found, a warning is logged but the fulfillment update proceeds
4. **Unknown Actions**: Unknown `ContractUpdateAction` values are logged as warnings

## Best Practices

1. **Use Descriptive Action Names**: Make action names clear and self-documenting
2. **Phase-Appropriate Actions**: Only set contract update actions on requirements in relevant phases (3, 4, 5)
3. **Test Thoroughly**: Always test the complete flow from requirement fulfillment to contract update
4. **Monitor Logs**: Check logs for any warnings about missing contracts or unknown actions

## Migration Notes

1. Run the migration: `dotnet ef database update`
2. Update existing requirements as needed with appropriate `ContractUpdateAction` values
3. The new field is nullable, so existing requirements will continue to work without contract updates

This system provides a flexible, maintainable way to automatically synchronize requirement fulfillments with contract status updates, reducing manual work and ensuring data consistency.