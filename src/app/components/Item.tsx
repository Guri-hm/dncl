const Item = ({ value }: { value: string | number }) => {
    return (
        <div className="w-full h-[50px] flex items-center justify-center my-2.5 border border-black rounded-lg">
            {value}
        </div>
    );
};
export default Item;
