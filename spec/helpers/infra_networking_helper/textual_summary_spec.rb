describe InfraNetworkingHelper::TextualSummary do
  include_examples "textual_group", "UNUSED?", %i(switch_type), "properties"

  include_examples "textual_group", "Relationships", %i(hosts)

  include_examples "textual_group_smart_management"
end
