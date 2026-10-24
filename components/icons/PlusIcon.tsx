import Icon, { IconProps } from "./Icon";

export default function PlusIcon(props: IconProps) {

    return (
        <Icon {...props}>
            <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path>
        </Icon>
    )
}