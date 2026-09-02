import { SalonForm } from "@/modules/salons/components/salons-form";
import { SalonList } from "@/modules/salons/components/salons-list";

const HomePage = () => {
	return (
		<div className=" items-center justify-center min-h-screen py-20">
			<SalonForm />

      <SalonList />
		</div>
	);
};

export default HomePage;
