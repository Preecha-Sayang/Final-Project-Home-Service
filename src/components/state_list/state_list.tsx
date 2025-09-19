import Image from "next/image";

interface StateItem {
    id: number;
    title: string;
    status: 'inactive' | 'pending' | 'active';
}

export default function StateList() {
    const stateItems: StateItem[] = [
        { id: 1, title: 'รายการ', status: 'inactive'},
        { id: 2, title: 'รายการ', status: 'pending'},
        { id: 3, title: 'รายการ', status: 'active'}   
    ];

    const statusStyles = {
       inactive: {
        iconBg: 'bg-gray-300',
        iconColor: 'text-white',
        textColor: 'text-gray-700',
        iconStyle: { backgroundColor: 'var(--gray-300)' }
       },
       pending: {
        iconBg: 'bg-white border-2 border-blue-500',
        iconColor: 'text-blue-500',
        textColor: 'text-blue-500',
        iconStyle: { backgroundColor: 'white', border: '2px solid var(--blue-500)' }
       },
       active: {
        iconBg: 'bg-blue-500',
        iconColor: 'text-white',
        textColor: 'text-blue-500',
        iconStyle: { backgroundColor: 'var(--blue-500)' }
       } 
    };

    const getStatusStyles = (status: StateItem['status']) => {
        return statusStyles[status] || statusStyles.inactive;
    };

    return (
        <div> {/*ทั้งก้อน */}
            <div className="space-y-8 mt-8"> {/*ส่วน main*/}
                {stateItems.map((item) => {
                    const styles = getStatusStyles(item.status);
                    return (
                        <div key={item.id} className="flex flex-col items-center">
                            {/*Icon */}
                            <div 
                                className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${styles.iconBg}`}
                                style={styles.iconStyle}
                            >
                                <Image 
                                    src="/images/icon_document.svg"
                                    alt="Icon document"
                                    width={32}
                                    height={32}
                                    className={`w-8 h-8 ${styles.iconColor}`} 
                                />
                            </div>
                            {/*Text*/}
                            <span 
                                className={`text-lg font-medium ${styles.textColor}`}
                                style={{ color: item.status === 'inactive' ? 'var(--gray-700)' : 'var(--blue-500)' }}
                            >
                                {item.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}