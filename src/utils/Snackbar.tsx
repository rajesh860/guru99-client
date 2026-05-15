import {type ProviderContext,  useSnackbar, type VariantType } from 'notistack';

interface InnerSnackbarProps {
    setUseSnackbarRef: (showSnackbar: ProviderContext) => void;
}

const InnerSnackbarUtilsConfigurator: React.FC<InnerSnackbarProps> = (props: InnerSnackbarProps) => {
    props.setUseSnackbarRef(useSnackbar());
    return null;
};

let useSnackbarRef: ProviderContext;

const setUseSnackbarRef = (useSnackbarRefProp: ProviderContext) => {
    useSnackbarRef = useSnackbarRefProp;
}

export const SnackbarUtilsConfigurator = () => {
    return (
        <InnerSnackbarUtilsConfigurator setUseSnackbarRef={setUseSnackbarRef} />
    )
}

const snackbarUtil = {
    success(msg: string | any) {
        this.toast(msg, "success")
    },
    warning(msg: string | any) {
        this.toast(msg, "warning")
    },
    info(msg: string | any) {
        this.toast(msg, "info")
    },
    error(msg: string | any) {
        this.toast(msg, "error")
    },
    toast(msg: string | any, variant: VariantType = "default") {
        useSnackbarRef?.enqueueSnackbar(msg, { variant });
    },
}

export default snackbarUtil;