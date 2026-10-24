export type IconProps = {
    width?: number;
    height?: number;
    className?: string;
    viewBox?: string;
};

type Props = IconProps & {
    children: React.ReactNode;
};

export default function Icon({ width = 24, height = 24, className = "", viewBox = "0 0 24 24", children }: Props) {
    
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            fill="currentColor"
            width={width}
            height={height}
            className={className}
        >
            {children}
        </svg>
    );
}