# Date Utilities

This module provides utility functions for handling date restrictions, particularly for Date of Birth fields and other personal information forms.

## Functions

### `getTodayDateString()`

Returns today's date formatted as `YYYY-MM-DD` for HTML date inputs.

**Usage Example:**
```tsx
// For HTML date inputs - prevents future date selection
<input 
    type="date" 
    name="dob" 
    max={getTodayDateString()} 
    required 
/>
```

### `getTodayDate()`

Returns today's date as a Date object, commonly used for DatePicker components' `maxDate` prop.

**Usage Example:**
```tsx
// For custom DatePicker components - prevents future date selection
<DatePicker 
    name="dob" 
    maxDate={getTodayDate()} 
    required 
/>
```

### `formatDateForInput(date: Date)`

Formats any Date object to the HTML date input format (`YYYY-MM-DD`).

**Usage Example:**
```tsx
const birthDate = new Date('1990-01-01');
const formattedDate = formatDateForInput(birthDate); // "1990-01-01"
```

## Date of Birth Restriction Pattern

For all Date of Birth fields, follow this pattern to prevent users from selecting future dates:

### HTML Date Inputs
```tsx
import { getTodayDateString } from '@/utils/dateUtils';

<FormItem label="Date of Birth" asterisk={true}>
    <Input
        type="date"
        name="dob"
        value={formData.dob}
        onChange={handleInputChange}
        max={getTodayDateString()}
        required
    />
</FormItem>
```

### Custom DatePicker Components
```tsx
import { getTodayDate } from '@/utils/dateUtils';

<FormItem label="Date of Birth" asterisk={true}>
    <DatePicker
        name="dob"
        value={formData.dob}
        onChange={handleDateChange}
        maxDate={getTodayDate()}
        required
    />
</FormItem>
```

## Implementation Notes

- **Future Date Restriction**: Date of Birth fields should never allow future dates since no one can be born in the future
- **Registration Expiry Dates**: These should NOT use the restriction as they need to allow future dates
- **Consistency**: Always use these utility functions instead of inline date calculations for maintainability
- **Validation**: The browser will automatically prevent users from selecting dates beyond the `max` attribute

## Browser Support

The `max` attribute for HTML date inputs is supported in all modern browsers. For older browsers, consider adding client-side validation as a fallback. 