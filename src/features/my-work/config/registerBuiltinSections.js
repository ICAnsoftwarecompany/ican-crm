/**
 * Side-effect module: registers the built-in My Work sections. Imported once by MyWorkBoard.
 * To add a section: create it in ../sections, register it here with its focuses/module/order,
 * add its strings under `myWork.sections.<id>` (ar + en), and document it in ../README.md.
 */
import { FOCUS_EVERYONE, MY_WORK_FOCUS } from '../constants/myWorkFocus'
import { registerMyWorkSection } from '../registry/myWorkRegistry'
import { MessagesSection } from '../sections/MessagesSection'
import { MyLeadsSection } from '../sections/MyLeadsSection'
import { MyTasksSection } from '../sections/MyTasksSection'
import { OverdueSection } from '../sections/OverdueSection'
import { ServiceWorkSection } from '../sections/ServiceWorkSection'
import { TodayActivitiesSection } from '../sections/TodayActivitiesSection'

registerMyWorkSection({ id: 'overdue', order: 10, size: 'wide', focuses: FOCUS_EVERYONE, component: OverdueSection })
registerMyWorkSection({ id: 'today', order: 20, focuses: FOCUS_EVERYONE, component: TodayActivitiesSection })
registerMyWorkSection({ id: 'tasks', order: 30, focuses: FOCUS_EVERYONE, component: MyTasksSection })
registerMyWorkSection({ id: 'leads', order: 40, focuses: [MY_WORK_FOCUS.sales], module: 'sales', component: MyLeadsSection })
registerMyWorkSection({ id: 'service', order: 50, focuses: [MY_WORK_FOCUS.service], module: 'customer_service', component: ServiceWorkSection })
registerMyWorkSection({ id: 'messages', order: 60, focuses: FOCUS_EVERYONE, component: MessagesSection })
