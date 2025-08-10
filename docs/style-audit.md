# Style Audit

This document audits the styles used in the Howzeverything application.

## `src/components/navigation/TopNavigation.tsx`

### Component: `Avatar`

- **`Link` (to="/profile")**
  - `textDecoration: 'none'`

- **`div` (main container)**
  - `width: '30px'`
  - `height: '30px'`
  - `borderRadius: '50%'`
  - `backgroundColor: profile?.avatar_url ? 'transparent' : '#642e32'`
  - `backgroundImage: profile?.avatar_url ? \`url(\${profile.avatar_url})\` : 'none'`
  - `backgroundSize: 'cover'`
  - `backgroundPosition: 'center'`
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `justifyContent: 'center'`
  - `flexShrink: 0`
  - `border: \`1px solid \${COLORS.white}\``
  - `boxShadow: STYLES.shadowSmall`
  - `color: COLORS.white`
  - `fontFamily: '"Pinyon Script", cursive'`
  - `fontSize: '1.6rem'`
  - `lineHeight: 1`

### Component: `TopNavigation`

- **`header` (main container)**
  - `position: 'fixed'`
  - `top: 0`
  - `left: 0`
  - `right: 0`
  - `height: '60px'`
  - `backgroundColor: COLORS.navBarDark`
  - `border: 'none'`
  - `zIndex: STYLES.zHeader`
  - `padding: \`0 \${SPACING[4]}\``
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `justifyContent: 'space-between'`

- **`div` (flex container)**
  - `flex: 1`
  - `display: 'flex'`
  - `justifyContent: 'flex-start'`

- **`img` (logo)**
  - `height: '60px'`
  - `width: 'auto'`

- **`div` (right container)**
  - `flex: 1`
  - `display: 'flex'`
  - `justifyContent: 'end'`
  - `alignItems: 'center'`
  - `gap: SPACING[4]`

- **`button` (toggle menu)**
  - `background: 'none'`
  - `border: 'none'`
  - `cursor: 'pointer'`
  - `padding: SPACING[2]`

### Constants Used

- `COLORS.white`
- `COLORS.navBarDark`
- `SPACING[2]`
- `SPACING[4]`
- `STYLES.shadowSmall`
- `STYLES.zHeader`

---

## `src/components/navigation/NavigationModal.tsx`

### Component: `NavigationModal`

- **`div` (main container)**
  - `position: 'fixed'`
  - `top: 0`
  - `left: 0`
  - `right: 0`
  - `bottom: 0`
  - `zIndex: STYLES.zModal - 1`

- **`div` (overlay)**
  - `position: 'absolute'`
  - `top: 0`
  - `left: 0`
  - `right: 0`
  - `bottom: 0`
  - `backgroundColor: 'rgba(0, 0, 0, 0.5)'`
  - `animation: 'fadeIn 0.3s ease'`

- **`div` (modal content)**
  - `position: 'absolute'`
  - `top: 0`
  - `right: 0`
  - `bottom: 0`
  - `width: 'min(300px, 80vw)'`
  - `backgroundColor: COLORS.navBarDark`
  - `boxShadow: STYLES.shadowLarge`
  - `display: 'flex'`
  - `flexDirection: 'column'`
  - `padding: \`\${SPACING[8]} \${SPACING[4]}\``
  - `animation: 'slideInFromRight 0.3s ease'`
  - `zIndex: STYLES.zModal`

- **`<style>` block**
  - `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`
  - `@keyframes slideInFromRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`

- **`button` (close)**
  - `position: 'absolute'`
  - `top: SPACING[4]`
  - `right: SPACING[4]`
  - `background: 'none'`
  - `border: 'none'`
  - `cursor: 'pointer'`
  - `padding: SPACING[2]`

- **`ul` (navigation list)**
  - `listStyle: 'none'`
  - `padding: 0`
  - `margin: \`calc(60px + \${SPACING[4]}) 0 0 0\``

- **`Link` (navigation item)**
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `gap: SPACING[4]`
  - `padding: \`\${SPACING[4]} \${SPACING[2]}\``
  - `textDecoration: 'none'`
  - `...TYPOGRAPHY['2xl']`
  - `color: linkColor` (dynamic: `COLORS.ratingGold` or `COLORS.textWhite`)
  - `fontWeight: TYPOGRAPHY.medium`
  - `borderRadius: STYLES.borderRadiusMedium`
  - `transition: 'background-color 0.2s ease'`
  - `onMouseEnter`: sets `backgroundColor` to `'rgba(255, 255, 255, 0.1)'`
  - `onMouseLeave`: sets `backgroundColor` to `'transparent'`

### Constants Used

- `COLORS.navBarDark`
- `COLORS.ratingGold`
- `COLORS.textWhite`
- `COLORS.white`
- `SPACING[2]`
- `SPACING[4]`
- `SPACING[8]`
- `STYLES.borderRadiusMedium`
- `STYLES.shadowLarge`
- `STYLES.zModal`
- `TYPOGRAPHY['2xl']`
- `TYPOGRAPHY.medium`

---

## `src/components/restaurant/RestaurantCard.tsx`

### Component: `RestaurantCard`

- **`menuButtonStyle` (style object)**
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `gap: SPACING[2]`
  - `width: '100%'`
  - `padding: \`\${SPACING[2]} \${SPACING[3]}\``
  - `border: 'none'`
  - `background: 'none'`
  - `cursor: 'pointer'`
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `textAlign: 'left'`
  - `transition: 'background-color 0.2s ease'`

- **`div` (main container)**
  - `position: 'relative'`
  - `cursor: 'pointer'`
  - `borderBottom: \`1px solid \${COLORS.gray200}\``
  - `padding: \`\${SPACING[3]} 0\``
  - `transition: 'background-color 0.2s ease'`
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.gray50`
  - `onMouseLeave`: sets `backgroundColor` to `'transparent'`

- **`div` (top row)**
  - `display: 'flex'`
  - `justifyContent: 'space-between'`
  - `alignItems: 'baseline'`
  - `gap: SPACING[2]`

- **`div` (h2 container)**
  - `flex: 1`
  - `minWidth: 0`

- **`h2` (restaurant name)**
  - `...FONTS.elegant`
  - `fontWeight: 500`
  - `color: COLORS.text`
  - `fontSize: '1.1rem'`
  - `lineHeight: 1.3`
  - `margin: 0`
  - `wordWrap: 'break-word'`
  - `className`: `hover:underline` (Tailwind)

- **`div` (controls container)**
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `gap: SPACING[2]`
  - `flexShrink: 0`

- **`span` (distance)**
  - `...FONTS.elegant`
  - `color: COLORS.accent`
  - `fontWeight: TYPOGRAPHY.semibold`
  - `fontSize: TYPOGRAPHY.sm.fontSize`

- **`div` (admin tag)**
  - `...FONTS.body`
  - `fontSize: '0.65rem'`
  - `fontWeight: '600'`
  - `padding: '2px 4px'`
  - `borderRadius: '4px'`
  - `color`: dynamic
  - `backgroundColor`: dynamic
  - `border`: dynamic

- **`button` (pin)**
  - `...STYLES.iconButton`
  - `width: '32px'`
  - `height: '32px'`
  - `border: 'none'`
  - `backgroundColor: 'transparent'`
  - `margin: '-6px'`

- **`svg` (pin icon)**
  - `fill`: dynamic (`isPinned ? COLORS.accent : "none"`)
  - `stroke`: dynamic (`isPinned ? COLORS.accent : "currentColor"`)

- **`div` (menu container)**
  - `position: 'relative'`

- **`button` (toggle menu)**
  - `...STYLES.iconButton`
  - `width: '32px'`
  - `height: '32px'`
  - `border: 'none'`
  - `backgroundColor: 'transparent'`
  - `margin: '-6px'`

- **`div` (dropdown menu)**
  - `...STYLES.card`
  - `position: 'absolute'`
  - `top: '100%'`
  - `right: 0`
  - `marginTop: SPACING[1]`
  - `zIndex: STYLES.zDropdown`
  - `width: '180px'`
  - `padding: SPACING[2]`
  - `boxShadow: STYLES.shadowLarge`
  - `backgroundColor: COLORS.white`

- **`button` (menu item)**
  - `...menuButtonStyle`
  - `color: COLORS.danger` (for delete button)

- **`div` (bottom row)**
  - `display: 'flex'`
  - `justifyContent: 'space-between'`
  - `alignItems: 'baseline'`
  - `gap: SPACING[2]`
  - `marginTop: SPACING[1]`

- **`p` (address)**
  - `...FONTS.body`
  - `color: COLORS.textSecondary`
  - `fontSize: '0.875rem'`
  - `margin: 0`
  - `whiteSpace: 'nowrap'`
  - `overflow: 'hidden'`
  - `textOverflow: 'ellipsis'`

- **`div` (stats container)**
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `gap: SPACING[3]`
  - `flexShrink: 0`
  - `paddingRight: statsPaddingRight` (dynamic)

- **`div` (stat item)**
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `gap: SPACING[1]`

- **`svg` (stat icon)**
  - `color: COLORS.accent`

- **`span` (stat value)**
  - `...FONTS.elegant`
  - `color: COLORS.textSecondary`
  - `fontWeight: TYPOGRAPHY.semibold`
  - `fontSize: TYPOGRAPHY.sm.fontSize`

### Constants Used

- `COLORS.accent`
- `COLORS.danger`
- `COLORS.gray200`
- `COLORS.gray50`
- `COLORS.gray500`
- `COLORS.primary`
- `COLORS.text`
- `COLORS.textSecondary`
- `COLORS.white`
- `FONTS.body`
- `FONTS.elegant`
- `SPACING[1]`
- `SPACING[2]`
- `SPACING[3]`
- `STYLES.card`
- `STYLES.iconButton`
- `STYLES.shadowLarge`
- `STYLES.zDropdown`
- `TYPOGRAPHY.semibold`
- `TYPOGRAPHY.sm.fontSize`

---

## `src/components/DishCard.tsx`

### Component: `Star`

- **`div` (main container)**
  - `display: 'inline-block'`
  - `position: 'relative'`
  - `width: size`
  - `height: size`
  - `lineHeight: '1'`
- **`svg` (base star)**
  - `position: 'absolute'`
  - `left: 0`
  - `top: 0`
- **`div` (filled portion)**
  - `position: 'absolute'`
  - `left: 0`
  - `top: 0`
  - `width: type === 'half' ? '50%' : '100%'`
  - `height: '100%'`
  - `overflow: 'hidden'`
- **`svg` (filled star)**
  - `position: 'absolute'`
  - `left: 0`
  - `top: 0`
  - `width: size`
  - `height: size`

### Component: `StarRating`

- **`button` (star)**
  - `background: 'none'`
  - `border: 'none'`
  - `padding: '0'`
  - `lineHeight: '1'`
  - `className`: `transition-all duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}` (Tailwind)
- **`button` (clear)**
  - `background: 'transparent'`
  - `border: 'none'`
  - `padding: 0`
  - `cursor: 'pointer'`
  - `color: COLORS.textSecondary`
  - `transition: 'color 0.2s ease, transform 0.2s ease'`
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `justifyContent: 'center'`
  - `lineHeight: 1`
  - `marginLeft: SPACING[1]`
  - `onMouseEnter`: sets `color` to `COLORS.danger`, `transform` to `'scale(1.15)'`
  - `onMouseLeave`: sets `color` to `COLORS.textSecondary`, `transform` to `'scale(1)'`

### Component: `RatingSummary`

- **`div` (main container)**
  - `display: 'flex'`
  - `flexDirection: 'column'`
  - `alignItems: 'flex-start'`
  - `gap: SPACING[1]`
- **`div` (row)**
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `gap: SPACING[2]`
- **`span` (label)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `color: COLORS.textSecondary`
  - `fontWeight: TYPOGRAPHY.medium`
- **`span` (value)**
  - `color: COLORS.text`
  - `fontWeight: TYPOGRAPHY.medium`
  - `fontSize: TYPOGRAPHY.sm.fontSize`

### Component: `RatingBreakdown`

- **`div` (main container)**
  - `backgroundColor: COLORS.gray50`
  - `padding: SPACING[4]`
  - `borderRadius: STYLES.borderRadiusMedium`
  - `marginTop: SPACING[4]`
- **`div` (flex container)**
  - `display: 'flex'`
  - `gap: SPACING[8]`
  - `alignItems: 'flex-start'`
- **`div` (column)**
  - `flex: 1`
  - `minWidth: 0`
- **`div` (label container)**
  - `marginBottom: SPACING[2]`
- **`span` (label)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `color: COLORS.textSecondary`
  - `fontWeight: TYPOGRAPHY.medium`
- **`span` (total ratings)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.xs.fontSize`
  - `color: COLORS.textSecondary`

### Component: `CommentsSection`

- **`div` (main container)**
  - `marginTop: SPACING[6]`
- **`button` (toggle)**
  - `background: 'none'`
  - `border: 'none'`
  - `padding: \`\${SPACING[3]} 0\``
  - `cursor: 'pointer'`
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `gap: SPACING[2]`
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.base.fontSize`
  - `color: COLORS.text`
  - `fontWeight: TYPOGRAPHY.medium`
  - `width: '100%'`
  - `textAlign: 'left'`
- **`svg` (toggle icon)**
  - `transform`: dynamic (`showComments ? 'rotate(180deg)' : 'rotate(0deg)'`)
  - `transition: 'transform 0.2s ease'`
  - `color: COLORS.gray400`
- **`div` (comments list)**
  - `marginTop: SPACING[3]`
  - `display: 'flex'`
  - `flexDirection: 'column'`
  - `gap: SPACING[3]`
- **`div` (comment)**
  - `backgroundColor: COLORS.gray50`
  - `padding: SPACING[4]`
  - `borderRadius: STYLES.borderRadiusMedium`
  - `cursor`: dynamic
- **`p` (comment text)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `color: COLORS.text`
  - `margin: 0`
  - `wordBreak: 'break-word'`
- **`p` (commenter info)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.xs.fontSize`
  - `color: COLORS.textSecondary`
  - `margin: 0`
  - `marginTop: SPACING[1]`
- **`button` (comment actions)**
  - `...STYLES.iconButton`
  - `width: '32px'`
  - `height: '32px'`
  - `backgroundColor: 'transparent'`
  - `border: 'none'`
- **`div` (action menu)**
  - `position: 'absolute'`
  - `bottom: '100%'`
  - `right: 0`
  - `marginBottom: SPACING[1]`
  - `backgroundColor: COLORS.white`
  - `borderRadius: STYLES.borderRadiusMedium`
  - `boxShadow: STYLES.shadowLarge`
  - `border: \`1px solid \${COLORS.gray200}\``
  - `overflow: 'hidden'`
  - `zIndex: STYLES.zDropdown`
  - `minWidth: '120px'`
- **`button` (menu item)**
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `gap: SPACING[2]`
  - `width: '100%'`
  - `padding: \`\${SPACING[2]} \${SPACING[3]}\``
  - `border: 'none'`
  - `background: 'none'`
  - `cursor: 'pointer'`
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `color`: dynamic (`COLORS.text` or `COLORS.danger`)
  - `textAlign: 'left'`
  - `transition: 'background-color 0.2s ease'`
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.gray50`
  - `onMouseLeave`: sets `backgroundColor` to `'transparent'`

### Component: `PortalModal`

- **`div` (modal content)**
  - `...STYLES.modal`
  - `animation: 'slideIn 0.3s ease'`

### Component: `DishCard`

- **`div` (collapsed card)**
  - `...STYLES.card`
  - `cursor: 'pointer'`
  - `transition: 'all 0.3s ease'`
  - `borderColor`: dynamic (`isHovering ? COLORS.accent : COLORS.gray200`)
  - `boxShadow`: dynamic (`isHovering ? STYLES.shadowMedium : STYLES.shadowSmall`)
  - `onMouseEnter`: sets `isHovering` to `true`
  - `onMouseLeave`: sets `isHovering` to `false`
- **`h3` (collapsed title)**
  - `...FONTS.heading`
  - `fontSize: TYPOGRAPHY.lg.fontSize`
  - `color: COLORS.gray900`
  - `margin: 0`
  - `marginBottom: SPACING[2]`
- **`div` (photo container)**
  - `width: '60px'`
  - `height: '60px'`
  - `borderRadius: STYLES.borderRadiusMedium`
  - `overflow: 'hidden'`
  - `flexShrink: 0`
- **`img` (photo)**
  - `width: '100%'`
  - `height: '100%'`
  - `objectFit: 'cover'`
- **`svg` (expand icon)**
  - `color: COLORS.gray400`
- **`div` (expanded card)**
  - `...STYLES.card`
  - `borderColor: COLORS.accent`
  - `boxShadow: STYLES.shadowLarge`
  - `cursor: 'default'`
- **`input` (edit name)**
  - `...STYLES.input`
  - `width: '100%'`
  - `boxSizing: 'border-box'`
- **`button` (cancel edit)**
  - `...STYLES.secondaryButton`
  - `padding: '8px 16px'`
  - `minHeight: '36px'`
- **`button` (save edit)**
  - `...STYLES.primaryButton`
  - `padding: '8px 16px'`
  - `minHeight: '36px'`
- **`p` (date added)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.xs.fontSize`
  - `color: COLORS.textSecondary`
  - `margin: 0`
  - `marginTop: SPACING[1]`
- **`button` (more options)**
  - `...STYLES.iconButton`
  - `width: '40px'`
  - `height: '40px'`
  - `backgroundColor`: dynamic (`isMenuOpen ? COLORS.gray100 : 'transparent'`)
- **`div` (dropdown menu)**
  - `position: 'absolute'`
  - `top: 'calc(100% + 4px)'`
  - `right: 0`
  - `backgroundColor: COLORS.white`
  - `borderRadius: STYLES.borderRadiusMedium`
  - `boxShadow: STYLES.shadowLarge`
  - `border: \`1px solid \${COLORS.gray200}\``
  - `overflow: 'hidden'`
  - `zIndex: STYLES.zDropdown`
  - `minWidth: '160px'`
- **`button` (menu item)**
  - `...menuButtonStyle` (defined in component)
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.gray50`
  - `onMouseLeave`: sets `backgroundColor` to `'transparent'`
- **`hr`**
  - `border: 0`
  - `borderTop: \`1px solid \${COLORS.gray200}\``
  - `margin: \`\${SPACING[1]} 0\``
- **`input` (file)**
  - `display: 'none'`
- **`div` (photos section)**
  - `marginTop: SPACING[3]`
- **`h3` (portal modal title)**
  - `...FONTS.heading`
  - `fontSize: TYPOGRAPHY.xl.fontSize`
  - `color: COLORS.gray900`
  - `marginBottom: SPACING[4]`

### Constants Used

- `COLORS.accent`
- `COLORS.danger`
- `COLORS.gray50`
- `COLORS.gray100`
- `COLORS.gray200`
- `COLORS.gray400`
- `COLORS.gray900`
- `COLORS.ratingEmpty`
- `COLORS.text`
- `COLORS.textSecondary`
- `COLORS.white`
- `FONTS.body`
- `FONTS.heading`
- `SPACING[1]`
- `SPACING[2]`
- `SPACING[3]`
- `SPACING[4]`
- `SPACING[6]`
- `SPACING[8]`
- `STYLES.borderRadiusMedium`
- `STYLES.card`
- `STYLES.iconButton`
- `STYLES.input`
- `STYLES.modal`
- `STYLES.modalOverlay`
- `STYLES.primaryButton`
- `STYLES.secondaryButton`
- `STYLES.shadowLarge`
- `STYLES.shadowMedium`
- `STYLES.shadowSmall`
- `STYLES.zDropdown`
- `TYPOGRAPHY.base.fontSize`
- `TYPOGRAPHY.lg.fontSize`
- `TYPOGRAPHY.medium`
- `TYPOGRAPHY.sm.fontSize`

---

## `src/components/DuplicateDishModal.tsx`

### Component: `DuplicateDishModal`

- **`div` (modal overlay)**
  - `position: 'fixed'`
  - `top: 0`
  - `left: 0`
  - `right: 0`
  - `bottom: 0`
  - `backgroundColor: 'rgba(0, 0, 0, 0.5)'`
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `justifyContent: 'center'`
  - `zIndex: 1000`
  - `padding: SPACING[4]`
- **`div` (modal content)**
  - `backgroundColor: COLORS.white`
  - `borderRadius: STYLES.borderRadiusLarge`
  - `padding: SPACING[6]`
  - `maxWidth: '500px'`
  - `width: '100%'`
  - `maxHeight: '80vh'`
  - `overflowY: 'auto'`
  - `boxShadow: STYLES.shadowLarge`
- **`h2` (title)**
  - `...FONTS.heading`
  - `fontSize: TYPOGRAPHY.xl.fontSize`
  - `color: COLORS.gray900`
  - `marginBottom: SPACING[2]`
- **`p` (description)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.base.fontSize`
  - `color: COLORS.textSecondary`
  - `margin: 0`
- **`div` (similar dish item)**
  - `backgroundColor`: dynamic
  - `border`: dynamic
  - `borderRadius: STYLES.borderRadiusMedium`
  - `padding: SPACING[4]`
  - `marginBottom`: dynamic
  - `cursor: 'pointer'`
  - `transition: 'all 0.2s ease'`
  - `onMouseEnter`: sets `backgroundColor`
  - `onMouseLeave`: sets `backgroundColor`
- **`h3` (dish name)**
  - `...FONTS.heading`
  - `fontSize: TYPOGRAPHY.base.fontSize`
  - `color: COLORS.gray900`
  - `marginBottom: SPACING[1]`
- **`span` (rating star)**
  - `color: COLORS.ratingGold`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
- **`span` (rating text)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `color: COLORS.text`
- **`span` (rating count)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.xs.fontSize`
  - `color: COLORS.textSecondary`
- **`span` (similarity description)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.xs.fontSize`
  - `color: COLORS.textSecondary`
- **`span` (similarity score)**
  - `backgroundColor`: dynamic
  - `color`: dynamic
  - `padding: \`\${SPACING[1]} \${SPACING[2]}\``
  - `borderRadius: STYLES.borderRadiusSmall`
  - `fontSize: TYPOGRAPHY.xs.fontSize`
  - `fontWeight: TYPOGRAPHY.medium`
- **`div` (best match)**
  - `color: COLORS.primary`
  - `fontSize: TYPOGRAPHY.xs.fontSize`
  - `fontWeight: TYPOGRAPHY.medium`
  - `marginLeft: SPACING[2]`
- **`p` (more dishes)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `color: COLORS.textSecondary`
  - `textAlign: 'center'`
  - `margin: \`\${SPACING[2]} 0 0 0\``
  - `fontStyle: 'italic'`
- **`button` (use existing)**
  - `...STYLES.primaryButton`
  - `padding: \`\${SPACING[3]} \${SPACING[4]}\``
  - `fontSize: TYPOGRAPHY.base.fontSize`
  - `fontWeight: TYPOGRAPHY.medium`
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.primaryHover`
  - `onMouseLeave`: sets `backgroundColor` to `COLORS.primary`
- **`button` (create new)**
  - `...STYLES.secondaryButton`
  - `padding: \`\${SPACING[3]} \${SPACING[4]}\``
  - `fontSize: TYPOGRAPHY.base.fontSize`
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.gray100`
  - `onMouseLeave`: sets `backgroundColor` to `COLORS.white`
- **`button` (cancel)**
  - `background: 'none'`
  - `border: 'none'`
  - `color: COLORS.textSecondary`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `cursor: 'pointer'`
  - `padding: SPACING[2]`
  - `textDecoration: 'underline'`
  - `onMouseEnter`: sets `color` to `COLORS.text`
  - `onMouseLeave`: sets `color` to `COLORS.textSecondary`

### Constants Used

- `COLORS.gray50`
- `COLORS.gray100`
- `COLORS.gray200`
- `COLORS.gray300`
- `COLORS.gray700`
- `COLORS.gray900`
- `COLORS.primary`
- `COLORS.primaryHover`
- `COLORS.ratingGold`
- `COLORS.text`
- `COLORS.textSecondary`
- `COLORS.white`
- `FONTS.body`
- `FONTS.heading`
- `SPACING[1]`
- `SPACING[2]`
- `SPACING[3]`
- `SPACING[4]`
- `SPACING[5]`
- `SPACING[6]`
- `STYLES.borderRadiusLarge`
- `STYLES.borderRadiusMedium`
- `STYLES.borderRadiusSmall`
- `STYLES.primaryButton`
- `STYLES.secondaryButton`
- `STYLES.shadowLarge`
- `TYPOGRAPHY.base.fontSize`
- `TYPOGRAPHY.medium`
- `TYPOGRAPHY.sm.fontSize`
- `TYPOGRAPHY.xl.fontSize`
- `TYPOGRAPHY.xs.fontSize`

---

## `src/components/location/LocationPermissionModal.tsx`

### Component: `LocationPermissionModal`

- **`div` (modal overlay)**
  - `style: STYLES.modalOverlay`
- **`div` (modal content)**
  - `...STYLES.modal`
  - `maxWidth: '450px'`
- **`h3` (title)**
  - `...TYPOGRAPHY.h3`
  - `marginTop: 0`
  - `color: COLORS.textPrimary`
- **`p` (instructions)**
  - `...TYPOGRAPHY.body`
  - `whiteSpace: 'pre-wrap'`
  - `color: COLORS.textSecondary`
  - `marginTop: SPACING[4]`
- **`div` (button container)**
  - `marginTop: SPACING[6]`
  - `display: 'flex'`
  - `justifyContent: 'flex-end'`
- **`button` (OK)**
  - `...STYLES.primaryButton`
  - `minWidth: '120px'`
  - `backgroundColor: COLORS.accent`
  - `color: COLORS.white`
  - `border: \`1px solid \${COLORS.text}\``

### Constants Used

- `COLORS.accent`
- `COLORS.text`
- `COLORS.textPrimary`
- `COLORS.textSecondary`
- `COLORS.white`
- `SPACING[4]`
- `SPACING[6]`
- `STYLES.modal`
- `STYLES.modalOverlay`
- `STYLES.primaryButton`
- `TYPOGRAPHY.body`
- `TYPOGRAPHY.h3`

---

## `src/HomeScreen.tsx`

### Component: `InfoCard`

- **`Link`**
  - `textDecoration: 'none'`
  - `display: 'block'`
- **`div` (card container)**
  - `...STYLES.card`
  - `padding: 0`
  - `overflow: 'hidden'`
  - `textAlign: 'center'`
  - `transition: 'transform 0.3s ease, box-shadow 0.3s ease'`
  - `transform`: dynamic (`isHovering ? 'scale(1.03)' : 'scale(1)'`)
  - `boxShadow`: dynamic (`isHovering ? STYLES.shadowLarge : STYLES.shadowMedium`)
  - `onMouseEnter`: sets `isHovering` to `true`
  - `onMouseLeave`: sets `isHovering` to `false`
- **`img`**
  - `width: '100%'`
  - `height: 'auto'`
  - `display: 'block'`
- **`div` (content container)**
  - `padding: SPACING[4]`
- **`h3` (title)**
  - `...FONTS.heading`
  - `...TYPOGRAPHY.h3`
  - `color: COLORS.text`
  - `margin: 0`

### Component: `HomeScreen`

- **`div` (main container)**
  - `backgroundColor: COLORS.navBarDark`
  - `marginLeft: 'calc(-50vw + 50%)'`
  - `marginRight: 'calc(-50vw + 50%)'`
  - `minHeight: '100vh'`
  - `boxSizing: 'border-box'`
  - `paddingBottom: SPACING[8]`
- **`div` (header section)**
  - `maxWidth: '700px'`
  - `margin: '0 auto'`
  - `padding: \`calc(60px + \${SPACING[4]}) \${SPACING[4]} \${SPACING[6]}\``
  - `display: 'flex'`
  - `flexDirection: 'column'`
  - `alignItems: 'center'`
  - `textAlign: 'center'`
- **`p` (description)**
  - `...FONTS.body`
  - `...TYPOGRAPHY.lg`
  - `color: COLORS.textWhite`
  - `lineHeight: 1.6`
  - `margin: 0`
- **`main`**
  - `maxWidth: '600px'`
  - `margin: '0 auto'`
  - `paddingLeft: SPACING[4]`
  - `paddingRight: SPACING[4]`
- **`div` (grid container)**
  - `display: 'grid'`
  - `gridTemplateColumns: '1fr'`
  - `gap: SPACING[6]`

### Constants Used

- `COLORS.navBarDark`
- `COLORS.text`
- `COLORS.textWhite`
- `FONTS.body`
- `FONTS.heading`
- `SPACING[4]`
- `SPACING[6]`
- `SPACING[8]`
- `STYLES.card`
- `STYLES.shadowLarge`
- `STYLES.shadowMedium`
- `TYPOGRAPHY.h3`
- `TYPOGRAPHY.lg`

---

## `src/RestaurantScreen.tsx`

### Component: `LocationPermissionBanner`

- **`div` (main container)**
  - `className`: `bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4` (Tailwind)
  - `marginBottom: SPACING[4]`
- **`p` (text)**
  - `...FONTS.primary`
  - `fontSize: '15px'`
  - `lineHeight: '1.5'`
  - `color: COLORS.gray700`
  - `margin: 0`
- **`button` (permission)**
  - `className`: `inline-flex items-center gap-1 transition-all duration-200 focus:outline-none` (Tailwind)
  - `color: COLORS.primary`
  - `fontWeight: '600'`
  - `textDecoration: 'none'`
  - `background: 'none'`
  - `border: 'none'`
  - `padding: '0'`
  - `cursor`: dynamic
  - `borderBottom`: `1px solid ${COLORS.primary}`
  - `opacity`: dynamic
  - `onMouseEnter`: sets `borderBottomColor` and `color` to `COLORS.primaryHover`
  - `onMouseLeave`: sets `borderBottomColor` and `color` to `COLORS.primary`

### Component: `SearchingIndicator`

- **`div` (main container)**
  - `marginTop: '8px'`
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `gap: '8px'`
  - `padding: '8px 12px'`
  - `borderRadius: '8px'`
  - `backgroundColor: 'rgba(255, 255, 255, 0.1)'`
  - `border: \`1px solid rgba(255, 255, 0.2)\``
  - `animation: 'pulse 2s ease-in-out infinite'`
- **`div` (pulse)**
  - `width: '16px'`
  - `height: '16px'`
  - `borderRadius: '50%'`
  - `backgroundColor: COLORS.primary`
  - `opacity`: dynamic
  - `transform`: dynamic
  - `transition: 'all 0.2s ease'`
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `justifyContent: 'center'`
- **`svg`**
  - `opacity: 0.9`
  - `transform`: dynamic
  - `transition: 'transform 0.2s ease'`
- **`span` (text)**
  - `...FONTS.elegant`
  - `fontSize: '14px'`
  - `color: COLORS.text`
  - `fontWeight: '500'`
  - `letterSpacing: '0.5px'`

### Component: `RestaurantScreen`

- **`div` (main container)**
  - `minHeight: '100vh'`
  - `display: 'flex'`
  - `flexDirection: 'column'`
  - `backgroundColor: COLORS.background`
  - `paddingBottom: SPACING[8]`
- **`main`**
  - `flex: 1`
  - `maxWidth: RESTAURANT_CARD_MAX_WIDTH`
  - `width: '100%'`
  - `margin: '0 auto'`
- **`h1` (title)**
  - `...TYPOGRAPHY.h1`
  - `color: COLORS.text`
  - `margin: 0`
- **`img` (header)**
  - `height: '95px'`
- **`p` (error)**
  - `color: COLORS.danger`
  - `...FONTS.elegant`
- **`button` (sort)**
  - `style`: dynamic (`STYLES.sortButtonActive` or `STYLES.sortButtonDefault`)
  - `color`: dynamic
  - `opacity`: dynamic
- **`p` (empty state)**
  - `...FONTS.elegant`
  - `color: COLORS.text`
  - `fontSize: '18px'`
  - `fontWeight: '500'`
  - `marginBottom: '8px'`
- **`button` (add first)**
  - `style: STYLES.addButton`
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.primaryHover`
  - `onMouseLeave`: sets `backgroundColor` to `COLORS.primary`
- **`label` (search)**
  - `...FONTS.elegant`
  - `fontSize: '1.1rem'`
  - `fontWeight: '600'`
  - `color: COLORS.text`
- **`button` (clear search)**
  - `background: 'transparent'`
  - `border: 'none'`
  - `padding: 0`
  - `cursor: 'pointer'`
  - `color: COLORS.textSecondary`
  - `transition: 'color 0.2s ease, transform 0.2s ease'`
  - `onMouseEnter`: sets `color` to `COLORS.danger`, `transform` to `'scale(1.15)'`
  - `onMouseLeave`: sets `color` to `COLORS.textSecondary`, `transform` to `'scale(1)'`
- **`input` (search)**
  - `...STYLES.input`
  - `...(isFocused && STYLES.inputFocusBlack)`
- **`div` (search results text)**
  - `...FONTS.elegant`
  - `fontSize: '14px'`
  - `color: COLORS.text`
  - `opacity: 0.8`
  - `marginTop: '8px'`
  - `marginBottom: 0`
- **`h3` (results header)**
  - `...FONTS.elegant`
  - `color: COLORS.text`
  - `fontSize: '18px'`
  - `fontWeight: '500'`
  - `margin: 0`
  - `paddingBottom: SPACING[2]`
- **`h4` (online result title)**
  - `...FONTS.elegant`
  - `fontSize: '16px'`
  - `fontWeight: '500'`
  - `color: COLORS.text`
  - `margin: '0 0 4px 0'`
- **`p` (online result address)**
  - `...FONTS.elegant`
  - `fontSize: '14px'`
  - `color: COLORS.text`
  - `opacity: 0.8`
  - `margin: 0`
  - `lineHeight: '1.4'`
- **`button` (import)**
  - `...STYLES.addButton`
  - `padding: '8px 16px'`
  - `fontSize: '14px'`
  - `opacity`: dynamic
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.primaryHover`
  - `onMouseLeave`: sets `backgroundColor` to `COLORS.primary`
- **`p` (add new)**
  - `...FONTS.elegant`
  - `fontSize: '0.95rem'`
  - `color: COLORS.text`
  - `marginBottom: '12px'`
- **`button` (add new)**
  - `className`: `px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105` (Tailwind)
  - `style: STYLES.addButton`
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.primaryHover`
  - `onMouseLeave`: sets `backgroundColor` to `COLORS.primary`
- **`button` (back)**
  - `className`: `p-2 rounded-full hover:opacity-80 transition-opacity focus:outline-none` (Tailwind)
  - `style: STYLES.iconButton`

### Constants Used

- `COLORS.background`
- `COLORS.danger`
- `COLORS.gray400`
- `COLORS.gray500`
- `COLORS.gray700`
- `COLORS.primary`
- `COLORS.primaryHover`
- `COLORS.text`
- `COLORS.textSecondary`
- `COLORS.white`
- `FONTS.elegant`
- `FONTS.primary`
- `RESTAURANT_CARD_MAX_WIDTH`
- `SPACING.containerPadding`
- `SPACING[2]`
- `SPACING[4]`
- `SPACING[6]`
- `SPACING[8]`
- `STYLES.addButton`
- `STYLES.iconButton`
- `STYLES.input`
- `STYLES.inputFocusBlack`
- `STYLES.sortButtonActive`
- `STYLES.sortButtonDefault`
- `TYPOGRAPHY.h1`

---

## `src/MenuScreen.tsx`

### Component: `DuplicateDishWarningModal`

- **`div` (modal overlay)**
  - `style: STYLES.modalOverlay`
- **`div` (modal content)**
  - `...STYLES.modal`
  - `maxWidth: '500px'`
  - `border: \`1px solid \${COLORS.border}\``
- **`h3` (title)**
  - `...TYPOGRAPHY.h3`
  - `color: COLORS.textPrimary`
  - `marginTop: 0`
  - `marginBottom: SPACING[2]`
- **`p` (description)**
  - `...TYPOGRAPHY.body`
  - `color: COLORS.textSecondary`
  - `marginBottom: SPACING[4]`
- **`ul` (duplicates list)**
  - `listStyle: 'none'`
  - `padding: 0`
  - `margin: \`0 0 \${SPACING[6]} 0\``
  - `maxHeight: '200px'`
  - `overflowY: 'auto'`
  - `border: \`1px solid \${COLORS.border}\``
  - `borderRadius: BORDERS.radius.medium`
- **`li` (duplicate item)**
  - `padding: \`\${SPACING[2]} \${SPACING[3]}\``
  - `borderBottom`: dynamic
  - `cursor: 'pointer'`
  - `color: COLORS.primary`
  - `fontWeight: TYPOGRAPHY.semibold`
  - `transition: 'background-color 0.2s ease'`
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.primaryLight`
  - `onMouseLeave`: sets `backgroundColor` to `'transparent'`
- **`button` (cancel)**
  - `...STYLES.secondaryButton`
  - `flex: 1`
  - `border: \`1px solid \${COLORS.gray300}\``
  - `color: COLORS.text`
- **`button` (confirm)**
  - `...STYLES.primaryButton`
  - `flex: 1`

### Component: `ConsolidatedSearchAndAdd`

- **`div` (main container)**
  - `backgroundColor: 'rgba(255, 255, 255, 0.1)'`
  - `backdropFilter: 'blur(4px)'`
  - `WebkitBackdropFilter: 'blur(4px)'`
  - `borderRadius: STYLES.borderRadiusLarge`
  - `padding: SPACING[4]`
- **`h2` (title)**
  - `...FONTS.heading`
  - `fontSize: TYPOGRAPHY.lg.fontSize`
  - `color: COLORS.text`
  - `margin: 0`
- **`button` (clear)**
  - `background: 'transparent'`
  - `border: 'none'`
  - `padding: 0`
  - `cursor: 'pointer'`
  - `color: COLORS.textSecondary`
  - `transition: 'color 0.2s ease, transform 0.2s ease'`
  - `onMouseEnter`: sets `color` to `COLORS.danger`, `transform` to `'scale(1.15)'`
  - `onMouseLeave`: sets `color` to `COLORS.textSecondary`, `transform` to `'scale(1)'`
- **`input`**
  - `...STYLES.input`
  - `...(isFocused && STYLES.inputFocusBlack)`
- **`p` (prompt)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `color: COLORS.textSecondary`
  - `margin: \`0 0 \${SPACING[2]} 0\``
- **`button` (add new dish)**
  - `...STYLES.primaryButton`
  - `padding: \`\${SPACING[2]} \${SPACING[4]}\``
  - `fontSize: TYPOGRAPHY.sm.fontSize`

### Component: `EnhancedAddDishForm`

- **`div` (main container)**
  - `backgroundColor: COLORS.white`
  - `borderRadius: STYLES.borderRadiusLarge`
  - `padding: SPACING[6]`
  - `boxShadow: STYLES.shadowLarge`
  - `border: \`1px solid \${COLORS.gray200}\``
- **`h3` (title)**
  - `...FONTS.heading`
  - `fontSize: TYPOGRAPHY.xl.fontSize`
  - `color: COLORS.gray900`
  - `marginBottom: SPACING[5]`
- **`label`**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `fontWeight: TYPOGRAPHY.medium`
  - `color: COLORS.textSecondary`
  - `display: 'block'`
  - `marginBottom: SPACING[2]`
- **`input`**
  - `...STYLES.input`
  - `borderWidth: '1px'`
- **`button` (star)**
  - `color`: dynamic
  - `background: 'none'`
  - `border: 'none'`
  - `padding: SPACING[1]`
  - `fontSize: '1.5rem'`
  - `cursor`: dynamic
  - `transition: 'all 0.2s ease'`
  - `opacity`: dynamic
  - `onMouseEnter`: sets `transform` to `'scale(1.1)'`
  - `onMouseLeave`: sets `transform` to `'scale(1)'`
- **`span` (rating text)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.base.fontSize`
  - `color: COLORS.text`
  - `marginLeft: SPACING[2]`
  - `minWidth: '30px'`
- **`button` (submit)**
  - `...STYLES.primaryButton`
  - `flex: 1`
  - `opacity`: dynamic
  - `cursor`: dynamic
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.primaryHover`
  - `onMouseLeave`: sets `backgroundColor` to `COLORS.primary`
- **`button` (cancel)**
  - `...STYLES.secondaryButton`
  - `flex: 1`
  - `opacity`: dynamic
  - `cursor`: dynamic

### Component: `MenuScreen`

- **`header`**
  - `backgroundColor: COLORS.white`
  - `borderBottom: \`1px solid \${COLORS.gray200}\``
  - `position: 'sticky'`
  - `top: '59px'`
  - `zIndex: 10`
  - `boxShadow: STYLES.shadowSmall`
  - `width: '100vw'`
  - `marginLeft: 'calc(50% - 50vw)'`
  - `marginRight: 'calc(50% - 50vw)'`
- **`div` (header content)**
  - `maxWidth: '768px'`
  - `margin: '0 auto'`
  - `padding: \`\${SPACING[3]} \${LAYOUT_CONFIG.APP_CONTAINER.padding}\``
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `justifyContent: 'space-between'`
- **`button` (back)**
  - `style: STYLES.iconButton`
- **`div` (restaurant name container)**
  - `flex: 1`
  - `textAlign: 'center'`
  - `margin: \`0 \${SPACING[2]}\``
  - `overflow: 'hidden'`
  - `cursor: 'pointer'`
- **`h1` (restaurant name)**
  - `...FONTS.heading`
  - `fontSize: TYPOGRAPHY.xl.fontSize`
  - `color: COLORS.gray900`
  - `margin: 0`
  - `textOverflow: 'ellipsis'`
  - `whiteSpace: 'nowrap'`
  - `overflow: 'hidden'`
- **`p` (address)**
  - `...FONTS.elegant`
  - `color: COLORS.text`
  - `opacity: 0.7`
  - `fontSize: '0.8rem'`
  - `lineHeight: '1.3'`
  - `margin: '2px 0 0 0'`
  - `textOverflow: 'ellipsis'`
  - `whiteSpace: 'nowrap'`
  - `overflow: 'hidden'`
- **`button` (pin)**
  - `...STYLES.iconButton`
  - `border: 'none'`
- **`svg` (pin icon)**
  - `fill`: dynamic
  - `stroke`: dynamic
- **`button` (sort options)**
  - `...STYLES.iconButton`
  - `backgroundColor`: dynamic
  - `color`: dynamic
  - `border`: dynamic
- **`button` (action menu)**
  - `...STYLES.iconButton`
  - `backgroundColor`: dynamic
- **`div` (dropdown menu)**
  - `position: 'absolute'`
  - `top: 'calc(100% + 4px)'`
  - `right: 0`
  - `backgroundColor: COLORS.white`
  - `borderRadius: STYLES.borderRadiusMedium`
  - `boxShadow: STYLES.shadowLarge`
  - `border: \`1px solid \${COLORS.gray200}\``
  - `overflow: 'hidden'`
  - `zIndex: STYLES.zDropdown`
  - `minWidth: '160px'`
- **`button` (menu item)**
  - `style: menuButtonStyle` (defined in component)
  - `onMouseEnter`: sets `backgroundColor`
  - `onMouseLeave`: sets `backgroundColor`
- **`div` (error)**
  - `backgroundColor: '#FEE2E2'`
  - `border: \`1px solid #FECACA\``
  - `borderRadius: STYLES.borderRadiusMedium`
  - `padding: SPACING[4]`
  - `textAlign: 'center'`
  - `marginBottom: SPACING[4]`
- **`div` (sort options container)**
  - `backgroundColor: COLORS.white`
  - `borderRadius: STYLES.borderRadiusLarge`
  - `padding: SPACING[4]`
  - `boxShadow: STYLES.shadowMedium`
  - `border: \`1px solid \${COLORS.gray200}\``
  - `marginBottom: SPACING[4]`
- **`button` (sort option)**
  - `style`: dynamic (`STYLES.sortButtonActive` or `STYLES.sortButtonDefault`)
- **`span` (rating star)**
  - `color`: dynamic
- **`div` (no search results)**
  - `textAlign: 'center'`
  - `padding: SPACING[6]`
  - `backgroundColor: COLORS.white`
  - `borderRadius: STYLES.borderRadiusLarge`
  - `boxShadow: STYLES.shadowMedium`
  - `border: \`1px solid \${COLORS.gray200}\``
- **`div` (no dishes)**
  - `backgroundColor: COLORS.white`
  - `borderRadius: STYLES.borderRadiusLarge`
  - `padding: SPACING[8]`
  - `textAlign: 'center'`
  - `boxShadow: STYLES.shadowMedium`
  - `border: \`1px solid \${COLORS.gray200}\``
- **`div` (no dishes icon)**
  - `color: COLORS.gray400`
  - `marginBottom: SPACING[4]`
- **`h2` (no dishes title)**
  - `...FONTS.heading`
  - `fontSize: TYPOGRAPHY.xl.fontSize`
  - `color: COLORS.gray900`
  - `marginBottom: SPACING[3]`
- **`p` (no dishes text)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.base.fontSize`
  - `color: COLORS.textSecondary`
  - `marginBottom: SPACING[5]`
- **`button` (add first dish)**
  - `style: STYLES.primaryButton`
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.primaryHover`
  - `onMouseLeave`: sets `backgroundColor` to `COLORS.primary`
- **`div` (full name modal)**
  - `...STYLES.modal`
  - `maxWidth: '500px'`
  - `textAlign: 'center'`
- **`p` (full name)**
  - `...FONTS.elegant`
  - `color: COLORS.text`
  - `marginBottom`: dynamic
  - `fontSize: '1.5rem'`
  - `fontWeight: 500`
  - `lineHeight: 1.4`
  - `wordBreak: 'break-word'`
- **`button` (close full name)**
  - `...STYLES.secondaryButton`
  - `width: '100%'`

### Constants Used

- `BORDERS.radius.medium`
- `COLORS.accent`
- `COLORS.background`
- `COLORS.border`
- `COLORS.danger`
- `COLORS.gray100`
- `COLORS.gray200`
- `COLORS.gray300`
- `COLORS.gray400`
- `COLORS.gray900`
- `COLORS.primary`
- `COLORS.primaryHover`
- `COLORS.primaryLight`
- `COLORS.ratingGold`
- `COLORS.red50`
- `COLORS.text`
- `COLORS.textPrimary`
- `COLORS.textSecondary`
- `COLORS.white`
- `FONTS.body`
- `FONTS.elegant`
- `FONTS.heading`
- `LAYOUT_CONFIG.APP_CONTAINER.padding`
- `SPACING[1]`
- `SPACING[2]`
- `SPACING[3]`
- `SPACING[4]`
- `SPACING[5]`
- `SPACING[6]`
- `SPACING[8]`
- `STYLES.borderRadiusLarge`
- `STYLES.borderRadiusMedium`
- `STYLES.iconButton`
- `STYLES.input`
- `STYLES.inputFocusBlack`
- `STYLES.modal`
- `STYLES.modalOverlay`
- `STYLES.primaryButton`
- `STYLES.secondaryButton`
- `STYLES.shadowLarge`
- `STYLES.shadowMedium`
- `STYLES.shadowSmall`
- `STYLES.sortButtonActive`
- `STYLES.sortButtonDefault`
- `STYLES.zDropdown`
- `TYPOGRAPHY.base.fontSize`
- `TYPOGRAPHY.h3`
- `TYPOGRAPHY.lg.fontSize`
- `TYPOGRAPHY.medium`
- `TYPOGRAPHY.semibold`
- `TYPOGRAPHY.sm.fontSize`
- `TYPOGRAPHY.xl.fontSize`

---

## `src/FindRestaurantScreen.tsx`

### Component: `FindRestaurantScreen`

- **`div` (main container)**
  - `backgroundColor: COLORS.background`
  - `minHeight: '100vh'`
- **`<style>` block**
  - `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`
- **`div` (header)**
  - `backgroundColor: COLORS.navBarDark`
  - `marginLeft: 'calc(-50vw + 50%)'`
  - `marginRight: 'calc(-50vw + 50%)'`
  - `marginBottom: SPACING[6]`
- **`div` (header content)**
  - `className`: `w-full max-w-lg mx-auto px-4 flex flex-col items-center` (Tailwind)
  - `paddingTop: \`calc(60px + \${SPACING[4]})\``
  - `paddingBottom: SPACING[6]`
- **`img` (header)**
  - `width: '180px'`
  - `marginTop: SPACING[4]`
  - `marginBottom: SPACING[4]`
  - `border: \`2px solid \${COLORS.white}\``
  - `borderRadius: STYLES.borderRadiusMedium`
  - `height: 'auto'`
  - `objectFit: 'contain'`
- **`h1` (title)**
  - `...TYPOGRAPHY.h1`
  - `color: COLORS.textWhite`
  - `marginBottom: SPACING[6]`
- **`div` (search bar trigger)**
  - `...STYLES.input`
  - `cursor: 'pointer'`
  - `color: COLORS.textSecondary`
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `gap: SPACING[2]`
- **`h2` (add form title)**
  - `...FONTS.elegant`
  - `color: COLORS.text`
  - `fontSize: '18px'`
  - `fontWeight: '500'`
- **`button` (nearby refresh)**
  - `background: 'none'`
  - `border: 'none'`
  - `padding: 0`
  - `cursor: 'pointer'`
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `opacity`: dynamic
- **`svg` (nearby refresh icon)**
  - `animation`: dynamic
- **`p` (nearby error)**
  - `className`: `text-sm text-red-700` (Tailwind)
- **`label` (distance)**
  - `...FONTS.elegant`
  - `color: COLORS.accent`
  - `fontSize: '1rem'`
  - `fontWeight: 500`
  - `marginLeft: '16px'`
  - `marginRight: '12px'`
- **`select` (distance)**
  - `border: \`1px solid \${COLORS.gray300}\``
  - `borderRadius: '8px'`
  - `padding: '0.25rem 0.5rem'`
  - `fontSize: '0.875rem'`
  - `backgroundColor: COLORS.white`
  - `cursor: 'pointer'`
  - `appearance: 'none'`
  - `backgroundImage`: url(...)
  - `backgroundPosition: 'right 0.5rem center'`
  - `backgroundRepeat: 'no-repeat'`
  - `backgroundSize: '1.25em 1.25em'`
  - `paddingRight: '2rem'`

### Constants Used

- `COLORS.accent`
- `COLORS.background`
- `COLORS.gray300`
- `COLORS.navBarDark`
- `COLORS.text`
- `COLORS.textSecondary`
- `COLORS.textWhite`
- `COLORS.white`
- `FONTS.elegant`
- `RESTAURANT_CARD_MAX_WIDTH`
- `SPACING[2]`
- `SPACING[4]`
- `SPACING[6]`
- `STYLES.borderRadiusMedium`
- `STYLES.input`
- `TYPOGRAPHY.h1`

---

## `src/DiscoveryScreen.tsx`

### Component: `DiscoveryScreen`

- **`selectStyle` (style object)**
  - `border: \`1px solid \${COLORS.gray300}\``
  - `borderRadius: '8px'`
  - `padding: '0.5rem 0.75rem'`
  - `fontSize: '0.875rem'`
  - `backgroundColor: COLORS.white`
  - `color: COLORS.text`
  - `cursor: 'pointer'`
  - `appearance: 'none'`
  - `backgroundImage`: url(...)
  - `backgroundPosition: 'right 0.5rem center'`
  - `backgroundRepeat: 'no-repeat'`
  - `backgroundSize: '1.25em 1.25em'`
  - `paddingRight: '2.5rem'`
  - `width: '100%'`
- **`div` (header)**
  - `backgroundColor: COLORS.navBarDark`
  - `marginLeft: 'calc(-50vw + 50%)'`
  - `marginRight: 'calc(-50vw + 50%)'`
  - `marginBottom: SPACING[6]`
- **`img` (header)**
  - `width: '180px'`
  - `marginTop: SPACING[4]`
  - `marginBottom: SPACING[4]`
  - `border: \`2px solid \${COLORS.white}\``
  - `borderRadius: STYLES.borderRadiusMedium`
  - `height: 'auto'`
  - `objectFit: 'contain'`
- **`h1` (title)**
  - `...TYPOGRAPHY.h1`
  - `color: COLORS.textWhite`
  - `marginBottom: SPACING[6]`
- **`input` (search)**
  - `style: STYLES.input`
- **`button` (reset)**
  - `position: 'absolute'`
  - `top: '-30px'`
  - `right: '-5px'`
  - `background: 'transparent'`
  - `border: 'none'`
  - `padding: 0`
  - `cursor: 'pointer'`
  - `color: COLORS.white`
  - `opacity: 0.7`
  - `transition: 'all 0.2s ease'`
  - `onMouseEnter`: sets `opacity` to `1`, `transform` to `'scale(1.15)'`
  - `onMouseLeave`: sets `opacity` to `0.7`, `transform` to `'scale(1)'`
- **`select` (filter)**
  - `style: selectStyle`
- **`p` (error)**
  - `...FONTS.elegant`
  - `color: COLORS.danger`
  - `fontSize: '18px'`
  - `fontWeight: '500'`
  - `marginBottom: '8px'`
- **`p` (empty state)**
  - `...FONTS.elegant`
  - `color: COLORS.text`
  - `fontSize: '18px'`
  - `fontWeight: '500'`
  - `marginBottom: '8px'`
- **`div` (restaurant group header)**
  - `display: 'flex'`
  - `justifyContent: 'space-between'`
  - `alignItems: 'center'`
  - `borderBottom: \`1px solid \${COLORS.gray200}\``
  - `paddingBottom: SPACING[2]`
- **`h2` (restaurant name)**
  - `...FONTS.elegant`
  - `fontSize: '1.125rem'`
  - `fontWeight: '600'`
  - `color: COLORS.primary`
  - `margin: 0`
  - `cursor: 'pointer'`
- **`span` (distance)**
  - `...FONTS.elegant`
  - `color: COLORS.accent`
  - `fontWeight: TYPOGRAPHY.semibold`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `flexShrink: 0`
  - `marginLeft: SPACING[3]`

### Constants Used

- `COLORS.accent`
- `COLORS.background`
- `COLORS.danger`
- `COLORS.gray200`
- `COLORS.gray300`
- `COLORS.navBarDark`
- `COLORS.primary`
- `COLORS.text`
- `COLORS.textWhite`
- `COLORS.white`
- `FONTS.elegant`
- `RESTAURANT_CARD_MAX_WIDTH`
- `SPACING[2]`
- `SPACING[3]`
- `SPACING[4]`
- `SPACING[6]`
- `STYLES.borderRadiusMedium`
- `STYLES.input`
- `TYPOGRAPHY.h1`
- `TYPOGRAPHY.semibold`
- `TYPOGRAPHY.sm.fontSize`

---

## `src/RatingsScreen.tsx`

### Component: `RatedDishCard`

- **`div` (main container)**
  - `...STYLES.card`
  - `cursor: 'pointer'`
  - `transition: 'all 0.2s ease'`
  - `onMouseEnter`: sets `borderColor` to `COLORS.accent`, `boxShadow` to `STYLES.shadowMedium`
  - `onMouseLeave`: sets `borderColor` to `COLORS.gray200`, `boxShadow` to `STYLES.shadowSmall`
- **`h3` (title)**
  - `...FONTS.heading`
  - `fontSize: TYPOGRAPHY.lg.fontSize`
  - `color: COLORS.gray900`
  - `margin: \`0 0 \${SPACING[1]} 0\``
- **`p` (restaurant info)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `color: COLORS.textSecondary`
  - `margin: \`0 0 \${SPACING[3]} 0\``
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `flexWrap: 'wrap'`
  - `gap: SPACING[1]`
- **`Link` (restaurant name)**
  - `color: COLORS.primary`
  - `fontWeight: '500'`
- **`span` (distance)**
  - `...FONTS.elegant`
  - `color: COLORS.accent`
  - `fontWeight: TYPOGRAPHY.semibold`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `marginLeft: SPACING[1]`
- **`span` (rating label)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `fontWeight: TYPOGRAPHY.medium`
  - `color: COLORS.textSecondary`
  - `width: '70px'`
- **`span` (average rating)**
  - `...TYPOGRAPHY.sm`
  - `color: COLORS.text`
  - `fontWeight: '500'`
- **`div` (photo container)**
  - `width: '80px'`
  - `height: '80px'`
  - `borderRadius: STYLES.borderRadiusMedium`
  - `overflow: 'hidden'`
  - `flexShrink: 0`
- **`img` (photo)**
  - `width: '100%'`
  - `height: '100%'`
  - `objectFit: 'cover'`

### Component: `RatingsScreen`

- **`div` (header)**
  - `backgroundColor: COLORS.navBarDark`
  - `marginLeft: 'calc(-50vw + 50%)'`
  - `marginRight: 'calc(-50vw + 50%)'`
- **`img` (header)**
  - `width: '180px'`
  - `height: 'auto'`
  - `objectFit: 'contain'`
  - `marginBottom: SPACING[4]`
  - `border: \`2px solid \${COLORS.white}\``
  - `borderRadius: STYLES.borderRadiusMedium`
- **`h1` (title)**
  - `...TYPOGRAPHY.h1`
  - `color: COLORS.textWhite`
  - `marginBottom: SPACING[4]`
- **`input` (search)**
  - `...STYLES.input`
  - `textAlign: 'center'`
- **`button` (reset)**
  - `position: 'absolute'`
  - `top: '-30px'`
  - `right: '-5px'`
  - `background: 'transparent'`
  - `border: 'none'`
  - `padding: 0`
  - `cursor: 'pointer'`
  - `color: COLORS.white`
  - `opacity: 0.7`
  - `transition: 'all 0.2s ease'`
  - `onMouseEnter`: sets `opacity` to `1`, `transform` to `'scale(1.15)'`
  - `onMouseLeave`: sets `opacity` to `0.7`, `transform` to `'scale(1)'`
- **`div` (body)**
  - `maxWidth: '768px'`
  - `margin: \`\${SPACING[6]} auto 0\``
  - `padding: \`0 \${SPACING[4]} \${SPACING[12]} \``
- **`div` (error)**
  - `textAlign: 'center'`
  - `color: COLORS.danger`
- **`button` (retry)**
  - `style: STYLES.primaryButton`
- **`div` (empty state)**
  - `textAlign: 'center'`
  - `color: COLORS.textSecondary`
  - `padding: SPACING[8]`
- **`Link` (empty state)**
  - `...STYLES.primaryButton`
  - `marginTop: SPACING[4]`

### Constants Used

- `COLORS.accent`
- `COLORS.danger`
- `COLORS.gray200`
- `COLORS.gray900`
- `COLORS.navBarDark`
- `COLORS.primary`
- `COLORS.text`
- `COLORS.textSecondary`
- `COLORS.textWhite`
- `COLORS.white`
- `FONTS.body`
- `FONTS.elegant`
- `FONTS.heading`
- `SPACING[1]`
- `SPACING[2]`
- `SPACING[3]`
- `SPACING[4]`
- `SPACING[6]`
- `SPACING[8]`
- `SPACING[12]`
- `STYLES.borderRadiusMedium`
- `STYLES.card`
- `STYLES.input`
- `STYLES.primaryButton`
- `STYLES.shadowMedium`
- `STYLES.shadowSmall`
- `TYPOGRAPHY.h1`
- `TYPOGRAPHY.lg.fontSize`
- `TYPOGRAPHY.medium`
- `TYPOGRAPHY.semibold`
- `TYPOGRAPHY.sm`
- `TYPOGRAPHY.sm.fontSize`

---

## `src/AdminScreen.tsx`

### Component: `PaginationControls`

- **`div` (main container)**
  - `display: 'flex'`
  - `justifyContent: 'center'`
  - `alignItems: 'center'`
  - `gap: SPACING[2]`
  - `marginTop: SPACING[4]`
  - `flexWrap: 'wrap'`
- **`button`**
  - `...TYPOGRAPHY.button`
  - `...STYLES.sortButtonDefault`
  - `cursor`: dynamic
- **`span`**
  - `...TYPOGRAPHY.body`
  - `padding: \`0 \${SPACING[2]}\``

### Component: `AdminScreen`

- **`div` (main container)**
  - `padding: SPACING[4]`
  - `maxWidth: '1200px'`
  - `margin: '0 auto'`
- **`h1` (title)**
  - `...TYPOGRAPHY.h1`
  - `marginBottom: SPACING[6]`
- **`div` (tabs container)**
  - `display: 'flex'`
  - `gap: SPACING[2]`
  - `marginBottom: SPACING[6]`
  - `borderBottom: \`2px solid \${COLORS.border}\``
  - `paddingBottom: SPACING[2]`
  - `flexWrap: 'wrap'`
- **`button` (tab)**
  - `...TYPOGRAPHY.button`
  - `padding: \`\${SPACING[2]} \${SPACING[4]}\``
  - `background`: dynamic
  - `color`: dynamic
  - `border: 'none'`
  - `borderRadius: \`\${BORDERS.radius.medium} \${BORDERS.radius.medium} 0 0\``
  - `cursor: 'pointer'`
- **`div` (error)**
  - `...TYPOGRAPHY.body`
  - `color: COLORS.error`
  - `background: \`\${COLORS.error}10\``
  - `padding: SPACING[4]`
  - `borderRadius: BORDERS.radius.medium`
  - `marginBottom: SPACING[4]`
  - `cursor: 'pointer'`
- **`div` (add restaurant container)**
  - `background: COLORS.surface`
  - `padding: SPACING[6]`
  - `borderRadius: BORDERS.radius.large`
  - `marginBottom: SPACING[6]`
  - `boxShadow: SHADOWS.small`
- **`h2`**
  - `...TYPOGRAPHY.h2`
  - `margin: 0`
- **`button` (reset)**
  - `background: 'transparent'`
  - `border: 'none'`
  - `padding: '4px'`
  - `cursor: 'pointer'`
  - `color: COLORS.textSecondary`
  - `transition: 'color 0.2s ease, transform 0.2s ease'`
  - `onMouseEnter`: sets `color` to `COLORS.primary`, `transform` to `'rotate(-90deg) scale(1.1)'`
  - `onMouseLeave`: sets `color` to `COLORS.textSecondary`, `transform` to `'rotate(0deg) scale(1)'`
- **`input`**
  - `style: STYLES.input`
- **`button` (add restaurant)**
  - `...TYPOGRAPHY.button`
  - `padding: SPACING[4]`
  - `background: COLORS.primary`
  - `color: COLORS.white`
  - `border: 'none'`
  - `borderRadius: BORDERS.radius.medium`
  - `cursor`: dynamic
  - `opacity`: dynamic
- **`button` (clear search)**
  - `position: 'absolute'`
  - `top: '50%'`
  - `right: '12px'`
  - `transform: 'translateY(-50%)'`
  - `background: 'transparent'`
  - `border: 'none'`
  - `cursor: 'pointer'`
  - `color: COLORS.textSecondary`
- **`div` (restaurant item)**
  - `background: COLORS.surface`
  - `padding: SPACING[4]`
  - `borderRadius: BORDERS.radius.medium`
  - `boxShadow: SHADOWS.small`
- **`h3` (restaurant name)**
  - `...TYPOGRAPHY.h3`
  - `marginBottom: SPACING[2]`
  - `cursor: 'pointer'`
  - `textDecoration: 'underline'`
- **`span` (manually added)**
  - `...TYPOGRAPHY.caption`
  - `color: COLORS.primary`
  - `marginLeft: SPACING[2]`
- **`p` (address)**
  - `...TYPOGRAPHY.body`
  - `color: COLORS.textSecondary`
  - `marginBottom: SPACING[2]`
- **`p` (dates)**
  - `...TYPOGRAPHY.caption`
  - `color: COLORS.textSecondary`
  - `marginBottom: SPACING[4]`
  - `fontSize: '0.75rem'`
- **`button` (edit/delete)**
  - `...TYPOGRAPHY.button`
  - `padding: \`\${SPACING[2]} \${SPACING[4]}\``
  - `background`: dynamic (`COLORS.primary` or `COLORS.error`)
  - `color: COLORS.white`
  - `border: 'none'`
  - `borderRadius: BORDERS.radius.small`
  - `cursor: 'pointer'`
- **`div` (comment item)**
  - `background`: dynamic (`COLORS.gray100` or `COLORS.surface`)
  - `padding: SPACING[4]`
  - `borderRadius: BORDERS.radius.medium`
  - `boxShadow: SHADOWS.small`
  - `opacity`: dynamic
- **`p` (comment text)**
  - `...TYPOGRAPHY.body`
  - `marginBottom: SPACING[2]`
- **`p` (comment meta)**
  - `...TYPOGRAPHY.caption`
  - `color: COLORS.textSecondary`
  - `marginBottom: SPACING[2]`
- **`span` (link)**
  - `color: COLORS.primary`
  - `textDecoration: 'underline'`
  - `cursor: 'pointer'`
- **`button` (hide/unhide)**
  - `...TYPOGRAPHY.button`
  - `padding: \`\${SPACING[2]} \${SPACING[4]}\``
  - `background`: dynamic (`COLORS.success` or `COLORS.warning`)
  - `color: COLORS.white`
  - `border: 'none'`
  - `borderRadius: BORDERS.radius.small`
  - `cursor: 'pointer'`
- **`span` (hidden)**
  - `...TYPOGRAPHY.caption`
  - `color: COLORS.error`
  - `fontWeight: 'bold'`
- **`div` (analytics controls)**
  - `display: 'flex'`
  - `flexWrap: 'wrap'`
  - `gap: SPACING[4]`
  - `alignItems: 'center'`
  - `background: COLORS.surface`
  - `padding: SPACING[4]`
  - `borderRadius: BORDERS.radius.medium`
  - `marginBottom: SPACING[6]`
- **`label` (analytics)**
  - `...TYPOGRAPHY.caption`
  - `display: 'block'`
  - `marginBottom: SPACING[1]`
- **`input` (analytics)**
  - `...STYLES.input`
  - `width: 'auto'`
- **`button` (fetch activity)**
  - `...TYPOGRAPHY.button`
  - `padding: \`\${SPACING[3]} \${SPACING[4]}\``
  - `background: COLORS.primary`
  - `color: COLORS.white`
  - `border: 'none'`
  - `borderRadius: BORDERS.radius.medium`
  - `cursor`: dynamic
  - `alignSelf: 'flex-end'`
  - `opacity`: dynamic
- **`div` (table container)**
  - `overflowX: 'auto'`
  - `background: COLORS.surface`
  - `borderRadius: BORDERS.radius.medium`
  - `padding: SPACING[2]`
- **`table`**
  - `width: '100%'`
  - `borderCollapse: 'collapse'`
  - `minWidth: '900px'`
- **`tr`**
  - `borderBottom: \`1px solid \${COLORS.border}\``
- **`th`**
  - `style: tableHeaderStyle`
  - `cursor: 'pointer'`
  - `whiteSpace: 'nowrap'`
  - `textAlign`: dynamic
- **`td`**
  - `style: tableCellStyle`
  - `fontWeight: TYPOGRAPHY.medium`
  - `textAlign`: dynamic
- **`span` (N/A)**
  - `color: COLORS.textSecondary`
- **`button` (back to all restaurants)**
  - `...STYLES.secondaryButton`
  - `marginBottom: SPACING[4]`
  - `display: 'inline-flex'`
  - `alignItems: 'center'`
  - `gap: SPACING[2]`
- **`div` (dishes for restaurant add form)**
  - `background: COLORS.surface`
  - `padding: SPACING[6]`
  - `borderRadius: BORDERS.radius.large`
  - `marginBottom: SPACING[6]`
  - `boxShadow: SHADOWS.small`
- **`button` (add dish)**
  - `...TYPOGRAPHY.button`
  - `background: COLORS.primary`
  - `color: COLORS.white`
  - `border: 'none'`
  - `borderRadius: BORDERS.radius.small`
  - `padding: \`\${SPACING[2]} \${SPACING[4]}\``
- **`div` (existing dishes list)**
  - `display: 'grid'`
  - `gap: SPACING[4]`
- **`div` (existing dish item)**
  - `background: COLORS.surface`
  - `padding: SPACING[4]`
  - `borderRadius: BORDERS.radius.medium`
  - `boxShadow: SHADOWS.small`
- **`button` (edit/delete dish)**
  - `...TYPOGRAPHY.button`
  - `padding: \`\${SPACING[2]} \${SPACING[4]}\``
  - `background`: dynamic
  - `color: COLORS.white`
  - `border: 'none'`
  - `borderRadius: BORDERS.radius.small`
  - `cursor: 'pointer'`

### Constants Used

- `BORDERS.radius.large`
- `BORDERS.radius.medium`
- `BORDERS.radius.small`
- `COLORS.border`
- `COLORS.error`
- `COLORS.gray100`
- `COLORS.primary`
- `COLORS.surface`
- `COLORS.success`
- `COLORS.textPrimary`
- `COLORS.textSecondary`
- `COLORS.warning`
- `COLORS.white`
- `SHADOWS.small`
- `SPACING[2]`
- `SPACING[3]`
- `SPACING[4]`
- `SPACING[6]`
- `STYLES.input`
- `STYLES.secondaryButton`
- `STYLES.sortButtonDefault`
- `TYPOGRAPHY.body`
- `TYPOGRAPHY.button`
- `TYPOGRAPHY.caption`
- `TYPOGRAPHY.h1`
- `TYPOGRAPHY.h2`
- `TYPOGRAPHY.h3`
- `TYPOGRAPHY.semibold`

---

## `src/AboutScreen.tsx`

### Component: `AboutScreen`

- **`div` (header)**
  - `backgroundColor: COLORS.navBarDark`
  - `marginLeft: 'calc(-50vw + 50%)'`
  - `marginRight: 'calc(-50vw + 50%)'`
- **`img` (header)**
  - `width: '180px'`
  - `height: 'auto'`
  - `objectFit: 'contain'`
  - `marginBottom: SPACING[4]`
  - `border: \`2px solid \${COLORS.white}\``
  - `borderRadius: STYLES.borderRadiusMedium`
- **`h1` (title)**
  - `...TYPOGRAPHY.h1`
  - `color: COLORS.textWhite`
  - `marginBottom: SPACING[4]`
- **`p` (header)**
  - `...TYPOGRAPHY.body`
  - `color: COLORS.textWhite`
  - `lineHeight: 1.7`
- **`div` (body)**
  - `maxWidth: '700px'`
  - `margin: \`\${SPACING[8]} auto 0\``
  - `padding: \`0 \${SPACING[4]} \${SPACING[12]}\``
  - `color: COLORS.text`
- **`h2`**
  - `...TYPOGRAPHY.h2`
  - `marginTop`: dynamic
  - `marginBottom: SPACING[3]`
- **`ol`**
  - `paddingLeft: SPACING[5]`
  - `listStyle: 'decimal'`
- **`li`**
  - `marginBottom: SPACING[3]`
- **`div` (join community)**
  - `marginTop: SPACING[10]`
  - `padding: SPACING[6]`
  - `backgroundColor: '#cac2af'`
  - `borderRadius: STYLES.borderRadiusLarge`
  - `textAlign: 'center'`
- **`h3` (join community)**
  - `...TYPOGRAPHY.h3`
  - `marginTop: 0`
  - `marginBottom: SPACING[3]`
  - `color: COLORS.accent`
- **`p` (join community)**
  - `margin: \`0 0 \${SPACING[4]} 0\``
- **`Link` (start dishing)**
  - `...STYLES.primaryButton`
  - `backgroundColor: COLORS.accent`

### Constants Used

- `COLORS.accent`
- `COLORS.navBarDark`
- `COLORS.text`
- `COLORS.textWhite`
- `COLORS.white`
- `SPACING[3]`
- `SPACING[4]`
- `SPACING[5]`
- `SPACING[6]`
- `SPACING[8]`
- `SPACING[10]`
- `SPACING[12]`
- `STYLES.borderRadiusLarge`
- `STYLES.borderRadiusMedium`
- `STYLES.primaryButton`
- `TYPOGRAPHY.body`
- `TYPOGRAPHY.h1`
- `TYPOGRAPHY.h2`
- `TYPOGRAPHY.h3`

---

## `src/ProfileScreen.tsx`

### Component: `ProfileScreen`

- **`div` (main container)**
  - `minHeight: '100vh'`
  - `backgroundColor: COLORS.background`
  - `paddingTop: SPACING[4]`
- **`div` (no user container)**
  - `backgroundColor: COLORS.white`
  - `borderRadius: STYLES.borderRadiusLarge`
  - `padding: \`\${SPACING[12]} \${SPACING[6]}\``
  - `boxShadow: STYLES.shadowMedium`
  - `border: \`1px solid \${COLORS.gray200}\``
  - `textAlign: 'center'`
- **`div` (no user icon)**
  - `fontSize: '3rem'`
  - `marginBottom: SPACING[3]`
- **`p` (no user text)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.base.fontSize`
  - `color: COLORS.textSecondary`
  - `margin: 0`

### Constants Used

- `COLORS.background`
- `COLORS.gray200`
- `COLORS.textSecondary`
- `COLORS.white`
- `FONTS.body`
- `SPACING[3]`
- `SPACING[4]`
- `SPACING[6]`
- `SPACING[12]`
- `STYLES.borderRadiusLarge`
- `STYLES.shadowMedium`
- `TYPOGRAPHY.base.fontSize`
- `TYPOGRAPHY.xl.fontSize`
- `TYPOGRAPHY.xs.fontSize`

---

## `src/components/shared/AddressInput.tsx`

### Component: `InputField`

- **`label`**
  - `...TYPOGRAPHY.caption`
  - `color: COLORS.textSecondary`
  - `marginBottom: SPACING[1]`
  - `display: 'block'`
- **`input`**
  - `style: STYLES.input`

### Component: `AddressInput`

- **`div` (main container)**
  - `marginBottom: SPACING[2]`
  - `position: 'relative'`
- **`label` (full address)**
  - `...FONTS.body`
  - `display: 'block'`
  - `fontWeight: TYPOGRAPHY.medium`
  - `color: COLORS.textSecondary`
  - `marginBottom: SPACING[2]`
- **`textarea` (full address)**
  - `...STYLES.input`
  - `minHeight: '80px'`
  - `resize: 'vertical'`
- **`div` (suggestions list)**
  - `position: 'absolute'`
  - `top: '100%'`
  - `left: 0`
  - `right: 0`
  - `background: COLORS.white`
  - `border: \`1px solid \${COLORS.gray200}\``
  - `borderRadius: STYLES.borderRadiusMedium`
  - `boxShadow: STYLES.shadowMedium`
  - `zIndex: STYLES.zDropdown`
  - `maxHeight: '200px'`
  - `overflowY: 'auto'`
- **`div` (suggestion item)**
  - `padding: \`\${SPACING[2]} \${SPACING[3]}\``
  - `cursor: 'pointer'`
  - `...FONTS.body`
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.gray100`
  - `onMouseLeave`: sets `backgroundColor` to `COLORS.white`
- **`div` (message container)**
  - `minHeight: '20px'`
  - `paddingTop: SPACING[1]`
- **`p` (message)**
  - `...TYPOGRAPHY.caption`
  - `color`: dynamic (`COLORS.primary`, `COLORS.danger`, `COLORS.success`)
- **`div` (parsed fields container)**
  - `borderTop: \`1px solid \${COLORS.border}\``
  - `paddingTop: SPACING[3]`
  - `marginTop: SPACING[2]`
- **`p` (parsed fields info)**
  - `...TYPOGRAPHY.caption`
  - `color: COLORS.textSecondary`
  - `marginTop: 0`
  - `marginBottom: SPACING[3]`
- **`div` (grid container)**
  - `display: 'grid'`
  - `gridTemplateColumns: '1fr 1fr'`
  - `gap: SPACING[3]`
  - `marginTop: SPACING[3]` (for second grid)

### Constants Used

- `COLORS.border`
- `COLORS.danger`
- `COLORS.gray100`
- `COLORS.gray200`
- `COLORS.primary`
- `COLORS.success`
- `COLORS.textSecondary`
- `COLORS.white`
- `FONTS.body`
- `SPACING[1]`
- `SPACING[2]`
- `SPACING[3]`
- `STYLES.borderRadiusMedium`
- `STYLES.input`
- `STYLES.shadowMedium`
- `STYLES.zDropdown`
- `TYPOGRAPHY.caption`
- `TYPOGRAPHY.medium`

---

## `src/components/restaurant/AddRestaurantForm.tsx`

### Component: `AddRestaurantForm`

- **`div` (main container)**
  - `className`: `bg-white/5 backdrop-blur-sm rounded-xl p-4 space-y-4` (Tailwind)
- **`p` (error message)**
  - `color: COLORS.danger`
  - `textAlign: 'center'`
- **`label` (restaurant name)**
  - `...TYPOGRAPHY.caption`
  - `color: COLORS.textSecondary`
  - `marginBottom: SPACING[1]`
  - `display: 'block'`
- **`input` (restaurant name)**
  - `style: STYLES.input`
- **`div` (button container)**
  - `display: 'flex'`
  - `gap: SPACING[3]`
  - `marginTop: SPACING[4]`
- **`button` (cancel)**
  - `...STYLES.secondaryButton`
  - `flex: 1`
  - `borderColor: COLORS.gray300`
  - `color: COLORS.text`
- **`button` (save)**
  - `...STYLES.primaryButton`
  - `flex: 1`
  - `border: 'none'`
  - `backgroundColor: COLORS.primary`

### Constants Used

- `COLORS.danger`
- `COLORS.gray300`
- `COLORS.primary`
- `COLORS.text`
- `COLORS.textSecondary`
- `SPACING[1]`
- `SPACING[3]`
- `SPACING[4]`
- `STYLES.input`
- `STYLES.primaryButton`
- `STYLES.secondaryButton`
- `TYPOGRAPHY.caption`

---

## `src/components/AddDishForm.tsx`

### Component: `StarRating`

- **`div` (main container)**
  - `className`: `flex gap-px` (Tailwind)
- **`button` (star)**
  - `className`: `transition-all duration-200 cursor-pointer hover:scale-105 focus:outline-none` (Tailwind)
  - `color`: dynamic (`star <= rating ? COLORS.primary : COLORS.ratingEmpty`)
  - `background: 'none'`
  - `border: 'none'`
  - `padding: '0 1px'`
  - `fontSize: '1.3rem'`
  - `lineHeight: '1'`

### Component: `AddDishForm`

- **`div` (main container)**
  - `className`: `bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-full max-w-full` (Tailwind)
- **`button` (Add New Dish)**
  - `className`: `transition-all duration-300 transform hover:scale-105 focus:outline-none w-full` (Tailwind)
  - `backgroundColor: COLORS.primary`
  - `color: COLORS.textWhite`
  - `border: 'none'`
  - `borderRadius: '12px'`
  - `padding: '12px 20px'`
  - `...FONTS.elegant`
  - `fontWeight: '500'`
  - `fontSize: '1rem'`
  - `width: '100%'`
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.primaryHover`
  - `onMouseLeave`: sets `backgroundColor` to `COLORS.primary`
- **`input` (dish name)**
  - `className`: `w-full max-w-full px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-white/50` (Tailwind)
  - `background: 'white'`
  - `fontSize: '1rem'`
  - `...FONTS.elegant`
  - `color: COLORS.text`
  - `maxWidth: 'calc(100% - 16px)'`
  - `boxSizing: 'border-box'`
- **`p` (rate this dish)**
  - `className`: `text-sm mb-0.5` (Tailwind)
  - `...FONTS.elegant`
  - `color: COLORS.text`
- **`button` (Add Dish)**
  - `className`: `py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1` (Tailwind)
  - `backgroundColor`: dynamic (`!dishName.trim() ? COLORS.gray300 : COLORS.primary`)
  - `color: COLORS.textWhite`
  - `border: 'none'`
  - `...FONTS.elegant`
  - `fontWeight: '500'`
  - `fontSize: '1rem'`
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.primaryHover`
  - `onMouseLeave`: sets `backgroundColor` to `COLORS.primary`
- **`button` (Cancel)**
  - `className`: `py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1` (Tailwind)
  - `...STYLES.secondaryButton`
  - `color: COLORS.primary`
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.gray700`
  - `onMouseLeave`: sets `backgroundColor` to `COLORS.white`

### Constants Used

- `COLORS.gray300`
- `COLORS.gray700`
- `COLORS.primary`
- `COLORS.primaryHover`
- `COLORS.ratingEmpty`
- `COLORS.text`
- `COLORS.textWhite`
- `COLORS.white`
- `FONTS.elegant`
- `STYLES.secondaryButton`

---

## `src/components/CommentForm.tsx`

### Component: `CommentForm`

- **`form`**
  - `width: '100%'`
- **`textarea`**
  - `...STYLES.input`
  - `...(isFocused ? STYLES.inputFocus : {})`
  - `minHeight: '100px'`
  - `resize: 'vertical'`
  - `marginBottom: SPACING[4]`
- **`div` (button container)**
  - `display: 'flex'`
  - `gap: SPACING[3]`
  - `justifyContent: 'flex-end'`
- **`button` (cancel)**
  - `...STYLES.secondaryButton`
  - `opacity`: dynamic
  - `cursor`: dynamic
- **`button` (submit)**
  - `...STYLES.primaryButton`
  - `opacity`: dynamic
  - `cursor`: dynamic
  - `backgroundColor`: dynamic
  - `borderColor`: dynamic
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.primaryHover`
  - `onMouseLeave`: sets `backgroundColor` to `COLORS.primary`

### Constants Used

- `COLORS.black`
- `COLORS.gray300`
- `COLORS.primary`
- `COLORS.primaryHover`
- `SPACING[3]`
- `SPACING[4]`
- `STYLES.input`
- `STYLES.inputFocus`
- `STYLES.primaryButton`
- `STYLES.secondaryButton`

---

## `src/components/user/UserForm.tsx`

### Component: `UserForm`

- **`div` (modal overlay)**
  - `position: 'fixed'`
  - `top: 0`
  - `left: 0`
  - `right: 0`
  - `bottom: 0`
  - `backgroundColor: 'rgba(0, 0, 0, 0.5)'`
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `justifyContent: 'center'`
  - `padding: '20px'`
  - `zIndex: 1000`
- **`div` (modal content)**
  - `backgroundColor: 'white'`
  - `borderRadius: '12px'`
  - `padding: '32px'`
  - `width: '100%'`
  - `maxWidth: '500px'`
  - `maxHeight: '90vh'`
  - `overflowY: 'auto'`
  - `boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'`
- **`div` (header)**
  - `marginBottom: '24px'`
  - `textAlign: 'center'`
- **`h2` (title)**
  - `...FONTS.elegant`
  - `fontSize: '24px'`
  - `fontWeight: '600'`
  - `color: COLORS.text`
  - `margin: '0 0 8px 0'`
- **`p` (subtitle)**
  - `...FONTS.elegant`
  - `fontSize: '14px'`
  - `color: COLORS.text`
  - `margin: 0`
- **`div` (error container)**
  - `backgroundColor: '#FEF2F2'`
  - `border: '1px solid #FECACA'`
  - `borderRadius: '8px'`
  - `padding: '12px'`
  - `marginBottom: '20px'`
- **`p` (error text)**
  - `...FONTS.elegant`
  - `fontSize: '14px'`
  - `color: COLORS.danger`
  - `margin: 0`
- **`label`**
  - `...FONTS.elegant`
  - `fontSize: '14px'`
  - `fontWeight: '500'`
  - `color: COLORS.text`
  - `display: 'block'`
  - `marginBottom: '6px'`
- **`input`**
  - `...FONTS.elegant`
  - `width: '100%'`
  - `padding: '12px'`
  - `border: '1px solid #D1D5DB'`
  - `borderRadius: '8px'`
  - `fontSize: '16px'`
  - `backgroundColor: 'white'`
  - `boxSizing: 'border-box'`
  - `WebkitAppearance: 'none'`
- **`p` (input description)**
  - `...FONTS.elegant`
  - `fontSize: '12px'`
  - `color: COLORS.text`
  - `margin: '4px 0 0 0'`
- **`div` (button container)**
  - `display: 'flex'`
  - `gap: '12px'`
  - `flexDirection: 'column'`
- **`button` (submit)**
  - `...FONTS.elegant`
  - `height: '50px'`
  - `backgroundColor`: dynamic
  - `color: 'white'`
  - `border: 'none'`
  - `borderRadius: '8px'`
  - `fontSize: '16px'`
  - `fontWeight: '600'`
  - `cursor`: dynamic
  - `WebkitAppearance: 'none'`
  - `WebkitTapHighlightColor: 'transparent'`
- **`button` (cancel)**
  - `...FONTS.elegant`
  - `height: '44px'`
  - `backgroundColor: 'transparent'`
  - `color: COLORS.text`
  - `border: '1px solid #D1D5DB'`
  - `borderRadius: '8px'`
  - `fontSize: '14px'`
  - `cursor`: dynamic
  - `WebkitAppearance: 'none'`
  - `WebkitTapHighlightColor: 'transparent'`

### Constants Used

- `COLORS.danger`
- `COLORS.gray300`
- `COLORS.primary`
- `COLORS.text`
- `FONTS.elegant`

---

## `src/components/PhotoModal.tsx`

### Component: `PhotoModal`

- **`div` (modal overlay)**
  - `...STYLES.modalOverlay`
  - `backgroundColor: 'rgba(0, 0, 0, 0.9)'`
  - `backdropFilter: 'blur(10px)'`
  - `animation: 'fadeIn 0.2s ease'`
- **`div` (modal content)**
  - `position: 'relative'`
  - `maxWidth: '90vw'`
  - `maxHeight: '90vh'`
  - `width: 'auto'`
  - `height: 'auto'`
  - `display: 'flex'`
  - `flexDirection: 'column'`
  - `backgroundColor: COLORS.black`
  - `borderRadius: STYLES.borderRadiusLarge`
  - `overflow: 'hidden'`
  - `animation: 'slideIn 0.3s ease'`
- **`div` (header controls)**
  - `position: 'absolute'`
  - `top: SPACING[4]`
  - `left: SPACING[4]`
  - `right: SPACING[4]`
  - `zIndex: 10`
  - `display: 'flex'`
  - `justifyContent: 'space-between'`
  - `alignItems: 'center'`
- **`div` (left controls)**
  - `display: 'flex'`
  - `gap: SPACING[3]`
  - `alignItems: 'center'`
- **`div` (photo counter)**
  - `padding: \`\${SPACING[2]} \${SPACING[3]}\``
  - `borderRadius: STYLES.borderRadiusMedium`
  - `backgroundColor: 'rgba(255, 255, 255, 0.9)'`
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `fontWeight: TYPOGRAPHY.medium`
  - `color: COLORS.black`
- **`button` (delete)**
  - `...STYLES.deleteButton`
  - `opacity`: dynamic
  - `cursor`: dynamic
- **`button` (edit caption)**
  - `...STYLES.deleteButton`
- **`button` (close)**
  - `width: '40px'`
  - `height: '40px'`
  - `borderRadius: '50%'`
  - `backgroundColor: 'rgba(255, 255, 255, 0.9)'`
  - `border: 'none'`
  - `cursor: 'pointer'`
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `justifyContent: 'center'`
  - `fontSize: '24px'`
  - `fontWeight: 'bold'`
  - `color: COLORS.black`
  - `transition: 'all 0.2s ease'`
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.white`, `transform` to `'scale(1.1)'`
  - `onMouseLeave`: sets `backgroundColor` to `'rgba(255, 255, 255, 0.9)'`, `transform` to `'scale(1)'`
- **`button` (navigation)**
  - `position: 'absolute'`
  - `left: SPACING[4]` or `right: SPACING[4]`
  - `top: '50%'`
  - `transform: 'translateY(-50%)'`
  - `zIndex: 10`
  - `width: '48px'`
  - `height: '48px'`
  - `borderRadius: '50%'`
  - `backgroundColor: 'rgba(255, 255, 255, 0.9)'`
  - `border: 'none'`
  - `cursor: 'pointer'`
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `justifyContent: 'center'`
  - `fontSize: '24px'`
  - `color: COLORS.black`
  - `transition: 'all 0.2s ease'`
  - `onMouseEnter`: sets `backgroundColor` to `COLORS.white`, `transform` to `'translateY(-50%) scale(1.1)'`
  - `onMouseLeave`: sets `backgroundColor` to `'rgba(255, 255, 255, 0.9)'`, `transform` to `'translateY(-50%) scale(1)'`
- **`div` (image container)**
  - `display: 'flex'`
  - `alignItems: 'center'`
  - `justifyContent: 'center'`
  - `minHeight: '400px'`
  - `padding: \`80px \${SPACING[8]} \${SPACING[6]}\``
- **`img`**
  - `maxWidth: '100%'`
  - `maxHeight: '70vh'`
  - `objectFit: 'contain'`
  - `borderRadius: STYLES.borderRadiusMedium`
- **`div` (photo info)**
  - `padding: SPACING[5]`
  - `backgroundColor: 'rgba(0, 0, 0, 0.8)'`
  - `borderTop: \`1px solid \${COLORS.gray700}\``
- **`textarea` (caption)**
  - `...STYLES.input`
  - `width: '100%'`
  - `color: COLORS.white`
  - `backgroundColor: 'rgba(255,255,255,0.1)'`
- **`div` (caption buttons)**
  - `display: 'flex'`
  - `justifyContent: 'flex-end'`
  - `gap: SPACING[2]`
  - `marginTop: SPACING[2]`
- **`button` (cancel caption)**
  - `...STYLES.secondaryButton`
- **`button` (save caption)**
  - `...STYLES.primaryButton`
- **`p` (caption text)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.base.fontSize`
  - `color: COLORS.white`
  - `margin: 0`
  - `marginBottom`: dynamic
- **`div` (photo metadata)**
  - `...FONTS.body`
  - `fontSize: TYPOGRAPHY.sm.fontSize`
  - `color: COLORS.gray400`

### Constants Used

- `COLORS.black`
- `COLORS.gray400`
- `COLORS.gray700`
- `COLORS.white`
- `FONTS.body`
- `SPACING[2]`
- `SPACING[3]`
- `SPACING[4]`
- `SPACING[5]`
- `SPACING[6]`
- `SPACING[8]`
- `STYLES.borderRadiusLarge`
- `STYLES.borderRadiusMedium`
- `STYLES.deleteButton`
- `STYLES.input`
- `STYLES.modalOverlay`
- `STYLES.primaryButton`
- `STYLES.secondaryButton`
- `TYPOGRAPHY.base.fontSize`
- `TYPOGRAPHY.medium`
- `TYPOGRAPHY.sm.fontSize`
