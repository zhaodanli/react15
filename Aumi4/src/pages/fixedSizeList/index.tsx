import { Link, history, useNavigate } from '@umijs/max';
import { Button } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
// import { FixedSizeList as ReactFixedSizeList } from 'react-window';
import './fixed-size-list.css';

const Row = ({ index, style }) => (
	<div className={index % 2 ? 'ListItemOdd' : 'ListItemEven'} style={style}>Row{index}</div>
)

export default function FixedSizeList() {
	// react-dom-v6
	const navigate = useNavigate();

	return (
		<PageContainer>
			{/* <ReactFixedSizeList
				className='List'
				height={200}
				width={200}
				itemSize={50}
				itemCount={1000}
			>
				{Row}
			</ReactFixedSizeList> */}
		</PageContainer>
	);
}
