import { Selector } from "testcafe";

// NOTE: Can't seem to target the right react component.
//       I believe this is because menu items aren't their own component
//       but that the new react library uses a function to output a base
//       JSX element
/*
export const SideMenu = {
  settlementWindowsButton: ReactSelector('MenuItems .rc-menu-item').withProps({ label: 'Settlement Windows' }),
  settlementsButton: ReactSelector('MenuItems .rc-menu-item').withProps({ label: 'Settlements' }),
};
*/

export const SideMenu = {
  settlementWindowsButton: Selector('.rc-menu-item').withText('Settlement Windows'),
  settlementsButton: Selector('.rc-menu-item').withText('Settlements'),
};
