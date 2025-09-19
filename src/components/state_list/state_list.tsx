interface StateItem {
    id: number;
    title: string;
    status: 'inactive' | 'pending' | 'active';
}

export default function StateList() {
    const stateItems: StateItem[] = [
        { id: 1, title: 'list', status: 'inactive'},
        { id: 2, title: 'list', status: 'pending'},
        { id: 3, title: 'list', status: 'active'}   
    ];

    const statusStyles = {
       inactive : {
        iconBg: 'var(--gray-300)',
        iconColor: 'var(--white)',
        textColor: 'var(--gray-700)'
       },
       pending : {
        iconBg: 'var(--blue-500)',
        iconColor: 'var(--blue-500)',
        textColor: 'var(--blue-500)'
       },
       active : {
        iconBg: 'var(--blue-500)',
        iconColor: 'var(--white)',
        textColor: 'var(--blue-500)'
       } 
    };

    const getStatusStyles = (status: StateItem['status']) => {
        return statusStyles[status] || statusStyles.inactive
    };

    return (
        <div> {/*ทั้งก้อน */}

        </div>
    )

}