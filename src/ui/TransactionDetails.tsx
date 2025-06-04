interface TransactionDetailsProps{
    tokenName: string,
    totalTokenInWei: number,
    totalTokenInEther: string
}

export default function TransactionDetails({
    tokenName,
    totalTokenInWei,
    totalTokenInEther
}:TransactionDetailsProps){
    return(
        <div>
            <p><strong>Token Name:</strong> {tokenName}</p>
            <p><strong>Total Token In Wei:</strong> {totalTokenInWei}</p>
            <p><strong>Total Token In Ether:</strong> {totalTokenInEther}</p>
        </div>
    );
}