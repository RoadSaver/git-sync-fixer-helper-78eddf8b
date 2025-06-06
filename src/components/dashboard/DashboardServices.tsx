
import React from 'react';
import ServiceCard from '@/components/service/ServiceCard';

type ServiceType = 'flat-tyre' | 'out-of-fuel' | 'other-car-problems' | 'tow-truck' | 'emergency' | 'support' | 'car-battery';

interface DashboardServicesProps {
  onServiceSelect: (service: ServiceType) => void;
}

const DashboardServices: React.FC<DashboardServicesProps> = ({ onServiceSelect }) => {
  console.log('DashboardServices render with onServiceSelect:', !!onServiceSelect);
  
  return (
    <div className="container max-w-md mx-auto px-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <ServiceCard type="flat-tyre" onClick={() => {
          console.log('Flat tyre clicked');
          onServiceSelect('flat-tyre');
        }} />
        <ServiceCard type="out-of-fuel" onClick={() => {
          console.log('Out of fuel clicked');
          onServiceSelect('out-of-fuel');
        }} />
        <ServiceCard type="car-battery" onClick={() => {
          console.log('Car battery clicked');
          onServiceSelect('car-battery');
        }} />
        <ServiceCard type="other-car-problems" onClick={() => {
          console.log('Other car problems clicked');
          onServiceSelect('other-car-problems');
        }} />
        <ServiceCard type="tow-truck" onClick={() => {
          console.log('Tow truck clicked');
          onServiceSelect('tow-truck');
        }} />
        <ServiceCard type="support" onClick={() => {
          console.log('Support clicked');
          onServiceSelect('support');
        }} />
      </div>
    </div>
  );
};

export default DashboardServices;
