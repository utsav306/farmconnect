// Type declarations for the project

// Make TypeScript more permissive with Components
declare namespace JSX {
  interface IntrinsicAttributes {
    [key: string]: any;
  }
}

// Allow any props for external components
declare module "@expo/vector-icons/*" {
  export interface IconProps {
    [key: string]: any;
  }
}

// Make MaterialCommunityIcons more permissive
declare module "@expo/vector-icons" {
  export class MaterialCommunityIcons extends React.Component<any, any> {
    static name: string;
  }
}

// Allow dynamic imports
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.svg";
