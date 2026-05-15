export const formatNumber = (num:number) => {
    if (num >= 1_000) {
        return `${(num / 1_000)?.toFixed()}K`;
    }
    return num?.toString();
};