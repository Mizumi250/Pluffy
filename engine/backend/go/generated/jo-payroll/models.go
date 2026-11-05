package jo_payroll

const ModuleName = "jo-payroll"

type JobOrder struct {
	AppointmentDate  *string  `json:"appointment_date" db:"appointment_date"`
	AppointmentOrder *int64   `json:"appointment_order" db:"appointment_order"`
	BasicPay         float64  `json:"basic_pay" db:"basic_pay"`
	CalamityLoan     *float64 `json:"calamity_loan" db:"calamity_loan"`
	CashCard         *string  `json:"cash_card" db:"cash_card"`
	CashCardNumber   *string  `json:"cash_card_number" db:"cash_card_number"`
	DisbursementType string   `json:"disbursement_type" db:"disbursement_type"`
	FirstName        *string  `json:"first_name" db:"first_name"`
	Funding          string   `json:"funding" db:"funding"`
	HdmfMpl          *float64 `json:"hdmf_mpl" db:"hdmf_mpl"`
	HdmfNo           *string  `json:"hdmf_no" db:"hdmf_no"`
	HdmfPremium      *float64 `json:"hdmf_premium" db:"hdmf_premium"`
	Id               int64    `json:"id" db:"id"`
	JobTitle         string   `json:"job_title" db:"job_title"`
	JorNumber        int64    `json:"jor_number" db:"jor_number"`
	JorPyrlGroup     *string  `json:"jor_pyrl_group" db:"jor_pyrl_group"`
	LastName         *string  `json:"last_name" db:"last_name"`
	MiddleName       *string  `json:"middle_name" db:"middle_name"`
	NameOfJo         string   `json:"name_of_jo" db:"name_of_jo"`
	SssAmount        *float64 `json:"sss_amount" db:"sss_amount"`
	SssNumber        *string  `json:"sss_number" db:"sss_number"`
	Status           string   `json:"status" db:"status"`
	CreatedAt        string   `json:"created_at" db:"created_at"`
	UpdatedAt        string   `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"JobOrder"}
