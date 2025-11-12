import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, Target, MapPin, AlertCircle, Heart, Award, CheckCircle, Zap } from "lucide-react";

const InvestorPresentation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-red-50 to-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title Slide */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="h-4 bg-gradient-to-r from-black via-red-600 to-green-600"></div>
          <div className="p-12 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">🇰🇪 EpiPredict Kenya</h1>
            <p className="text-2xl text-gray-600 mb-6">
              Predicting Disease Outbreaks 14 Days Before They Happen
            </p>
            <div className="flex justify-center gap-6 flex-wrap">
              <Badge className="text-lg py-2 px-4 bg-green-600">Investor Pitch Deck</Badge>
              <Badge variant="outline" className="text-lg py-2 px-4">Healthcare AI</Badge>
              <Badge variant="outline" className="text-lg py-2 px-4">Kenya Market</Badge>
            </div>
          </div>
        </div>

        {/* 1. PROBLEM */}
        <section id="problem" className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 rounded-full p-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">1. The Problem</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-600">
              <h3 className="text-xl font-bold text-red-900 mb-4">🚨 Kenya's Healthcare Crisis</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold">•</span>
                  <div>
                    <strong>Cholera outbreaks:</strong> Recurrent in informal settlements (Kibera, Mathare, Mukuru) - <strong>300-500 cases</strong> per outbreak
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold">•</span>
                  <div>
                    <strong>Malaria surges:</strong> Western Kenya (Kisumu, Busia, Siaya) face seasonal spikes - <strong>1,200-1,800 cases</strong> during peaks
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold">•</span>
                  <div>
                    <strong>COVID-19 waves:</strong> Caught hospitals unprepared (2020-2023) - ICU beds ran out
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold">•</span>
                  <div>
                    <strong>Hospital overcrowding:</strong> Emergency departments overwhelmed by <strong>30-40%</strong> during outbreaks
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold">•</span>
                  <div>
                    <strong>Medication stockouts:</strong> Pharmacies run out of critical drugs (ORS, antimalarials, antibiotics)
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 rounded-lg p-6 border-l-4 border-amber-600">
              <h3 className="text-xl font-bold text-amber-900 mb-4">💰 The Financial Impact</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600">Emergency Overcrowding Costs</div>
                  <div className="text-3xl font-bold text-gray-900">KSh 2-5M</div>
                  <div className="text-sm text-gray-600">per facility annually</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600">Staff Overtime During Outbreaks</div>
                  <div className="text-3xl font-bold text-gray-900">KSh 500K-1M</div>
                  <div className="text-sm text-gray-600">per outbreak event</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600">Lost Revenue (Stockouts)</div>
                  <div className="text-3xl font-bold text-gray-900">15-25%</div>
                  <div className="text-sm text-gray-600">for pharmacies during outbreaks</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg p-6 border-2 border-red-300">
            <h3 className="text-lg font-bold text-gray-900 mb-2">⚠️ Current Surveillance System Failures</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong className="text-red-700">IDSR (Integrated Disease Surveillance):</strong>
                <p className="text-gray-700 mt-1">Manual reporting with <strong>2-4 weeks delay</strong> - outbreaks detected too late</p>
              </div>
              <div>
                <strong className="text-red-700">No Predictive Capability:</strong>
                <p className="text-gray-700 mt-1">Hospitals react <strong>after</strong> surge begins - no time to prepare resources</p>
              </div>
              <div>
                <strong className="text-red-700">Limited Staff Resources:</strong>
                <p className="text-gray-700 mt-1">County health departments lack capacity for real-time disease tracking</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SOLUTION */}
        <section id="solution" className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 rounded-full p-3">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">2. The Solution: EpiPredict</h2>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border-2 border-green-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Disease Outbreak Prediction System</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              EpiPredict uses artificial intelligence to analyze social media conversations, weather patterns, and historical disease data 
              to predict outbreaks <strong className="text-green-700">14-21 days in advance</strong> with <strong className="text-green-700">&gt;95% accuracy</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-6 border-t-4 border-blue-600">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Data Collection</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>12M+ Twitter</strong> (Swahili & Sheng)</li>
                <li>• <strong>15M+ Facebook</strong> posts analyzed</li>
                <li>• Weather data (malaria risk)</li>
                <li>• Historical outbreak patterns</li>
                <li>• All 47 counties monitored</li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border-t-4 border-purple-600">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Prediction Engine</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Machine learning models</li>
                <li>• Kenyan disease pattern training</li>
                <li>• Natural language processing</li>
                <li>• <strong>14-21 day advance warning</strong></li>
                <li>• <strong>&gt;95% accuracy rate</strong></li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border-t-4 border-green-600">
              <div className="text-4xl mb-3">🚨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Actionable Alerts</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• SMS/WhatsApp notifications</li>
                <li>• Specific action recommendations</li>
                <li>• County-level precision</li>
                <li>• Disease type identification</li>
                <li>• Estimated case volumes</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-black via-red-600 to-green-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4">🇰🇪 Built Specifically for Kenya</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>• Language:</strong> Swahili, Sheng, English NLP
              </div>
              <div>
                <strong>• Geography:</strong> All 47 counties covered
              </div>
              <div>
                <strong>• Diseases:</strong> Malaria, cholera, flu, typhoid, dengue, COVID
              </div>
              <div>
                <strong>• Infrastructure:</strong> Works with unstable internet (offline mode)
              </div>
              <div>
                <strong>• Integration:</strong> NHIF, M-Pesa, Kenyan EMR systems
              </div>
              <div>
                <strong>• Support:</strong> 24/7 from Nairobi office
              </div>
            </div>
          </div>
        </section>

        {/* 3. VALUE PROPOSITION */}
        <section id="value" className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 rounded-full p-3">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">3. Value Proposition</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-600">
              <h3 className="text-xl font-bold text-green-900 mb-4">🏥 For Hospitals</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">Reduce Emergency Overcrowding</span>
                    <Badge className="bg-green-600">30-40%</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Prepare beds, staff, and resources before surge hits</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">Prevent Medicine Stockouts</span>
                    <Badge className="bg-green-600">100%</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Know what drugs to stock 2-3 weeks in advance</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">Save Costs</span>
                    <Badge className="bg-green-600">KSh 2-5M/year</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Reduce overtime, emergency procurement, wastage</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-600">
              <h3 className="text-xl font-bold text-blue-900 mb-4">💊 For Pharmacies</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">Increase Revenue</span>
                    <Badge className="bg-blue-600">15-25%</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Stock the right medicines before demand spikes</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">Prevent Lost Sales</span>
                    <Badge className="bg-blue-600">KSh 500K-2M/year</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Never run out during outbreaks - customers stay loyal</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">Competitive Advantage</span>
                    <Badge className="bg-blue-600">Market Leader</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Be the pharmacy that's always prepared</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-600">
            <h3 className="text-xl font-bold text-purple-900 mb-4">🏛️ For County Governments</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Protect Citizens</div>
                <div className="text-2xl font-bold text-gray-900">1M-4M</div>
                <div className="text-sm text-gray-600">people per county</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Budget Planning</div>
                <div className="text-2xl font-bold text-gray-900">2-3 weeks</div>
                <div className="text-sm text-gray-600">advance notice</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Proactive Response</div>
                <div className="text-2xl font-bold text-gray-900">Early</div>
                <div className="text-sm text-gray-600">interventions save lives</div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-6 border-2 border-yellow-500">
            <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Unique Kenyan Value</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-orange-700">10x Cheaper than Global Tools:</strong>
                <p className="text-gray-700 mt-1">BlueDot costs ~KSh 13M/year. EpiPredict: KSh 150K-2.5M/year</p>
              </div>
              <div>
                <strong className="text-orange-700">ROI in 2-3 Months:</strong>
                <p className="text-gray-700 mt-1">First predicted outbreak saves more than annual subscription</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. MARKET OPPORTUNITY */}
        <section id="market" className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 rounded-full p-3">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">4. Market Opportunity</h2>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white text-center mb-6">
            <div className="text-5xl font-bold mb-2">KSh 3.6 Billion</div>
            <div className="text-xl">Total Addressable Market (Kenya)</div>
            <div className="text-sm opacity-90 mt-2">Healthcare disease prediction & surveillance systems</div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-600">
              <h3 className="text-lg font-bold text-green-900 mb-3">🏥 Hospitals Segment</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Market Size:</span>
                  <span className="font-bold text-green-700">KSh 2.1B</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Target Count:</span>
                  <span className="font-bold">50+ Major Facilities</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Avg Deal Size:</span>
                  <span className="font-bold">KSh 750K-2.5M/year</span>
                </div>
                <div className="bg-white rounded p-3 mt-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Key Targets:</div>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Kenyatta National (1,800 beds)</li>
                    <li>• Moi Teaching & Referral (900 beds)</li>
                    <li>• Coast General (600 beds)</li>
                    <li>• Aga Khan, Nairobi Hospital</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-600">
              <h3 className="text-lg font-bold text-blue-900 mb-3">💊 Pharmacy Chains</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Market Size:</span>
                  <span className="font-bold text-blue-700">KSh 890M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Target Count:</span>
                  <span className="font-bold">200+ Chain Locations</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Avg Deal Size:</span>
                  <span className="font-bold">KSh 2.5M/year (chains)</span>
                </div>
                <div className="bg-white rounded p-3 mt-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Key Targets:</div>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Goodlife Pharmacy (50+ branches)</li>
                    <li>• Careplus Pharmacy (30+ branches)</li>
                    <li>• Haltons, Boots, Pharma Plus</li>
                    <li>• Medilife Pharmacy</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-600">
              <h3 className="text-lg font-bold text-purple-900 mb-3">🏛️ County Governments</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Market Size:</span>
                  <span className="font-bold text-purple-700">KSh 650M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Target Count:</span>
                  <span className="font-bold">47 Counties</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Avg Deal Size:</span>
                  <span className="font-bold">KSh 150K-750K/year</span>
                </div>
                <div className="bg-white rounded p-3 mt-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Priority Counties:</div>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Nairobi (4.3M people)</li>
                    <li>• Kiambu (2.4M people)</li>
                    <li>• Mombasa (1.2M people)</li>
                    <li>• Nakuru (2.2M people)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-6 border-2 border-green-500">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Market Entry Strategy: 3 Phases</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm font-bold text-green-700 mb-2">Phase 1: Nairobi (Months 1-6)</div>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• 3-5 pilots in Nairobi</li>
                  <li>• Prove {'>'}90% accuracy</li>
                  <li>• Convert to 3-5 paying customers</li>
                  <li>• <strong>Target: KSh 4M ARR</strong></li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm font-bold text-blue-700 mb-2">Phase 2: Urban Kenya (Months 7-18)</div>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Expand to Mombasa, Kisumu, Nakuru</li>
                  <li>• Scale to 40 customers</li>
                  <li>• Cover 5-8 counties</li>
                  <li>• <strong>Target: KSh 50M ARR</strong></li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm font-bold text-purple-700 mb-2">Phase 3: National (Months 19-36)</div>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• All 47 counties</li>
                  <li>• 100+ customers</li>
                  <li>• Government partnerships</li>
                  <li>• <strong>Target: KSh 150M ARR</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5. COMPETITION */}
        <section id="competition" className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 rounded-full p-3">
              <Target className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">5. Competitive Landscape</h2>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6 mb-6 border-l-4 border-yellow-600">
            <h3 className="text-lg font-bold text-gray-900 mb-2">🎯 Competitive Advantage: Built for Kenya</h3>
            <p className="text-gray-700">
              Global competitors (BlueDot, HealthMap) are expensive, US-centric, and don't understand Kenyan context. 
              EpiPredict is purpose-built for Kenya's unique disease patterns, languages, and budget constraints.
            </p>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Feature</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-green-700">EpiPredict (Us)</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-600">BlueDot</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-600">HealthMap</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-600">Manual IDSR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-semibold">Kenya-Specific Training</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-green-600">✓ Yes</Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-red-600">✗ No</td>
                  <td className="px-4 py-3 text-center text-red-600">✗ No</td>
                  <td className="px-4 py-3 text-center text-red-600">✗ No</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold">Swahili/Sheng NLP</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-green-600">✓ Yes</Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-red-600">✗ No</td>
                  <td className="px-4 py-3 text-center text-red-600">✗ No</td>
                  <td className="px-4 py-3 text-center text-red-600">✗ No</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-semibold">All 47 Counties Covered</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-green-600">✓ Yes</Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-yellow-600">Partial</td>
                  <td className="px-4 py-3 text-center text-yellow-600">Partial</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-green-600">✓ Yes</Badge>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold">Advance Warning Time</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-green-600">14-21 days</Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">7-14 days</td>
                  <td className="px-4 py-3 text-center text-gray-700">Real-time only</td>
                  <td className="px-4 py-3 text-center text-red-600">2-4 weeks behind</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-semibold">Accuracy Rate</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-green-600">&gt;95%</Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">85-90%</td>
                  <td className="px-4 py-3 text-center text-gray-700">80-85%</td>
                  <td className="px-4 py-3 text-center text-gray-700">N/A</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold">Annual Price (Hospital)</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-green-600">KSh 750K-2.5M</Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-red-600">~KSh 13M</td>
                  <td className="px-4 py-3 text-center text-red-600">~KSh 8M</td>
                  <td className="px-4 py-3 text-center text-gray-700">Free (gov)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-semibold">M-Pesa Integration</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-green-600">✓ Yes</Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-red-600">✗ No</td>
                  <td className="px-4 py-3 text-center text-red-600">✗ No</td>
                  <td className="px-4 py-3 text-center text-red-600">✗ No</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold">Local Support (Nairobi)</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-green-600">24/7</Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">Email only</td>
                  <td className="px-4 py-3 text-center text-gray-700">Email only</td>
                  <td className="px-4 py-3 text-center text-gray-700">County staff</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-600">
              <div className="text-3xl mb-3">🇰🇪</div>
              <h3 className="font-bold text-green-900 mb-3">Kenya-First Design</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Trained on Kenyan disease patterns</li>
                <li>• Swahili & Sheng social media</li>
                <li>• Informal settlement tracking</li>
                <li>• M-Pesa & NHIF integration</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-600">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-bold text-blue-900 mb-3">10x More Affordable</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• KSh 150K-2.5M vs KSh 8-13M</li>
                <li>• Quarterly payment options</li>
                <li>• County government discounts</li>
                <li>• ROI in 2-3 months</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-600">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-bold text-purple-900 mb-3">Superior Service</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• 24/7 Nairobi-based support</li>
                <li>• On-site installation & training</li>
                <li>• Works offline (unstable internet)</li>
                <li>• Direct CEO access</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. REVENUE MODEL */}
        <section id="revenue" className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">6. Revenue Model & Pricing</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-600">
              <div className="text-sm font-semibold text-blue-700 mb-3">STARTER TIER</div>
              <div className="text-4xl font-bold text-gray-900 mb-2">KSh 12.5K</div>
              <div className="text-sm text-gray-600 mb-4">per month (KSh 150K/year)</div>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>Single location</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>1 county coverage</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>3 diseases monitored</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>Email alerts</span>
                </div>
              </div>
              <div className="text-xs text-gray-600 italic">
                Target: Small clinics, individual pharmacies
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-600 relative">
              <Badge className="absolute top-4 right-4 bg-green-600">POPULAR</Badge>
              <div className="text-sm font-semibold text-green-700 mb-3">PROFESSIONAL TIER</div>
              <div className="text-4xl font-bold text-gray-900 mb-2">KSh 62.5K</div>
              <div className="text-sm text-gray-600 mb-4">per month (KSh 750K/year)</div>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Multi-location (up to 5)</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>3 counties coverage</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>All diseases monitored</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>SMS + Email + WhatsApp</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Dedicated support</span>
                </div>
              </div>
              <div className="text-xs text-gray-600 italic">
                Target: Mid-size hospitals, pharmacy chains (5-10 branches)
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-600">
              <div className="text-sm font-semibold text-purple-700 mb-3">ENTERPRISE TIER</div>
              <div className="text-4xl font-bold text-gray-900 mb-2">KSh 208K</div>
              <div className="text-sm text-gray-600 mb-4">per month (KSh 2.5M/year)</div>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span>Unlimited locations</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span>All 47 counties</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span>Custom disease tracking</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span>API access</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span>Priority 24/7 support</span>
                </div>
              </div>
              <div className="text-xs text-gray-600 italic">
                Target: Large hospital networks, county governments
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Revenue Breakdown (Year 1)</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3">Revenue Streams</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">SaaS Subscriptions (70%):</span>
                    <span className="font-bold">KSh 16.1M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Implementation Services (20%):</span>
                    <span className="font-bold">KSh 4.6M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Training & Support (10%):</span>
                    <span className="font-bold">KSh 2.3M</span>
                  </div>
                  <div className="border-t-2 border-blue-300 pt-2 flex justify-between">
                    <span className="font-bold text-gray-900">Total Year 1 Revenue:</span>
                    <span className="font-bold text-green-600 text-lg">KSh 23M</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3">Customer Mix (Year 1 - 17 customers)</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Starter (4 customers):</span>
                    <span className="font-bold">KSh 600K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Professional (10 customers):</span>
                    <span className="font-bold">KSh 7.5M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Enterprise (3 customers):</span>
                    <span className="font-bold">KSh 7.5M</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-2 italic">
                    Average revenue per customer: KSh 1.35M/year
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-6 border-2 border-green-500">
            <h3 className="text-lg font-bold text-gray-900 mb-3">📈 Unit Economics</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Avg Revenue/Customer</div>
                <div className="text-3xl font-bold text-green-600">KSh 125K</div>
                <div className="text-xs text-gray-600">per month</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Variable Cost/Customer</div>
                <div className="text-3xl font-bold text-orange-600">KSh 60K</div>
                <div className="text-xs text-gray-600">per month</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Contribution Margin</div>
                <div className="text-3xl font-bold text-green-700">KSh 65K</div>
                <div className="text-xs text-gray-600">52% margin</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">LTV : CAC Ratio</div>
                <div className="text-3xl font-bold text-purple-600">5:1</div>
                <div className="text-xs text-gray-600">Healthy</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. TRACTION */}
        <section id="traction" className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-yellow-100 rounded-full p-3">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">7. Current Traction & Validation</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-600">
              <h3 className="text-xl font-bold text-green-900 mb-4">✅ What We've Achieved</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>MVP Built & Tested:</strong> Working prototype with {'>'}95% accuracy on historical Kenyan outbreak data
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>Pilot Partners Secured:</strong> 3-5 Nairobi organizations ready for 90-day free pilots
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>AI Model Trained:</strong> Swahili/Sheng NLP trained on 12M+ Kenyan social media posts
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>Letters of Intent:</strong> KSh 4M+ in pipeline commitments from pilot partners
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-600">
              <h3 className="text-xl font-bold text-blue-900 mb-4">🎯 Upcoming Milestones (Next 6 Months)</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">Month 1-2:</span>
                    <Badge className="bg-blue-600">Q1 2025</Badge>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Launch 3 Nairobi pilots</li>
                    <li>• Finalize website (epipredict.co.ke)</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">Month 3-4:</span>
                    <Badge className="bg-blue-600">Q2 2025</Badge>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Track June-August flu season</li>
                    <li>• Generate video testimonials</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">Month 5-6:</span>
                    <Badge className="bg-green-600">Revenue!</Badge>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Convert to 3-5 paying customers</li>
                    <li>• Target: KSh 4M ARR</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center border-2 border-purple-600">
              <div className="text-4xl font-bold text-purple-700 mb-2">3-5</div>
              <div className="text-sm text-gray-700">Pilot Partners</div>
              <div className="text-xs text-gray-600 mt-1">Nairobi hospitals & pharmacies</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center border-2 border-green-600">
              <div className="text-4xl font-bold text-green-700 mb-2">&gt;95%</div>
              <div className="text-sm text-gray-700">Accuracy Rate</div>
              <div className="text-xs text-gray-600 mt-1">Validated on historical data</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center border-2 border-blue-600">
              <div className="text-4xl font-bold text-blue-700 mb-2">KSh 4M</div>
              <div className="text-sm text-gray-700">Pipeline (LOIs)</div>
              <div className="text-xs text-gray-600 mt-1">Committed annual revenue</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 text-center border-2 border-orange-600">
              <div className="text-4xl font-bold text-orange-700 mb-2">12M+</div>
              <div className="text-sm text-gray-700">Social Posts</div>
              <div className="text-xs text-gray-600 mt-1">Training dataset (Swahili/Sheng)</div>
            </div>
          </div>
        </section>

        {/* 8. FINANCIAL PROJECTIONS */}
        <section id="financials" className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 rounded-full p-3">
              <DollarSign className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">8. Financial Projections & Break-Even</h2>
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white text-center mb-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm opacity-90 mb-1">Break-Even Month</div>
                <div className="text-5xl font-bold mb-2">19</div>
                <div className="text-sm opacity-90">Base Case Scenario</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-1">Customers at Break-Even</div>
                <div className="text-5xl font-bold mb-2">28</div>
                <div className="text-sm opacity-90">Monthly revenue: KSh 3.5M</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-1">Total Funding Required</div>
                <div className="text-5xl font-bold mb-2">KSh 40M</div>
                <div className="text-sm opacity-90">Seed round for 24 months</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-600">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💸 Monthly Fixed Costs</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Team Salaries (7 people @ KSh 250K avg):</span>
                  <span className="font-bold">KSh 1,800,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Cloud Infrastructure (AWS/Azure):</span>
                  <span className="font-bold">KSh 300,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Office & Operations:</span>
                  <span className="font-bold">KSh 250,000</span>
                </div>
                <div className="border-t-2 border-red-300 pt-2 mt-2 flex justify-between">
                  <span className="font-bold">Total Fixed Costs:</span>
                  <span className="font-bold text-red-700">KSh 2,350,000</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-600">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💸 Variable Costs per Customer (Monthly)</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Social Media APIs:</span>
                  <span className="font-bold">KSh 20,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer Support:</span>
                  <span className="font-bold">KSh 30,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Infrastructure (incremental):</span>
                  <span className="font-bold">KSh 10,000</span>
                </div>
                <div className="border-t-2 border-orange-300 pt-2 mt-2 flex justify-between">
                  <span className="font-bold">Total Variable Cost/Customer:</span>
                  <span className="font-bold text-orange-700">KSh 60,000</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Break-Even Math</h3>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Monthly Fixed Costs:</span>
                <span className="font-bold">KSh 2,350,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Revenue per Customer:</span>
                <span className="font-bold">KSh 125,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Variable Cost per Customer:</span>
                <span className="font-bold">KSh 60,000</span>
              </div>
              <div className="border-t-2 border-blue-300 pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Contribution Margin:</span>
                  <span className="font-bold text-green-600">KSh 65,000</span>
                </div>
                <div className="text-xs text-gray-600 italic mt-1">
                  (Revenue - Variable Cost = KSh 125,000 - KSh 60,000)
                </div>
              </div>
              
              <div className="border-t-2 border-blue-300 pt-3 mt-3">
                <div className="text-lg font-bold text-center text-gray-900 mb-2">
                  Break-Even Customers = Fixed Costs ÷ Contribution Margin
                </div>
                <div className="text-2xl font-bold text-center text-green-600">
                  2,350,000 ÷ 65,000 = 36.2 customers
                </div>
                <div className="text-center text-gray-600 mt-2">
                  Need <strong>37 customers</strong> to break even monthly
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-500 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📈 3-Year Revenue Projection</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-sm text-gray-600 mb-1">Year 1</div>
                <div className="text-4xl font-bold text-green-600 mb-1">KSh 23M</div>
                <div className="text-sm text-gray-600">17 customers</div>
                <div className="text-xs text-gray-500 mt-2">5-8 counties covered</div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-sm text-gray-600 mb-1">Year 2</div>
                <div className="text-4xl font-bold text-blue-600 mb-1">KSh 85M</div>
                <div className="text-sm text-gray-600">60 customers</div>
                <div className="text-xs text-gray-500 mt-2">15-20 counties</div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-sm text-gray-600 mb-1">Year 3</div>
                <div className="text-4xl font-bold text-purple-600 mb-1">KSh 210M</div>
                <div className="text-sm text-gray-600">140 customers</div>
                <div className="text-xs text-gray-500 mt-2">All 47 counties</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border-2 border-amber-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">💰 Use of Funds (KSh 40M Seed Round)</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Cumulative losses to break-even:</span>
                    <span className="font-bold">KSh 25,000,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Working capital buffer (3 months):</span>
                    <span className="font-bold">KSh 7,500,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Growth investments (marketing, sales):</span>
                    <span className="font-bold">KSh 7,500,000</span>
                  </div>
                  <div className="border-t-2 border-amber-300 pt-2 flex justify-between">
                    <span className="font-bold text-gray-900">Total Seed Funding:</span>
                    <span className="font-bold text-green-600 text-lg">KSh 40,000,000</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Runway</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">24 months</div>
                <div className="text-sm text-gray-600">To profitability + buffer</div>
                <div className="text-xs text-gray-500 mt-3">
                  Conservative: Covers break-even at Month 24 with safety margin
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 border-2 border-purple-500">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Three Scenarios</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Scenario</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">Break-Even Month</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">Customers Needed</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">Monthly Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-blue-50">
                    <td className="px-4 py-3 text-sm font-semibold">Conservative</td>
                    <td className="px-4 py-3 text-center text-sm">24</td>
                    <td className="px-4 py-3 text-center text-sm">35</td>
                    <td className="px-4 py-3 text-right text-sm font-bold">KSh 2.9M</td>
                  </tr>
                  <tr className="bg-green-100 font-semibold">
                    <td className="px-4 py-3 text-sm">Base Case ⭐</td>
                    <td className="px-4 py-3 text-center text-sm">19</td>
                    <td className="px-4 py-3 text-center text-sm">28</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-green-700">KSh 3.5M</td>
                  </tr>
                  <tr className="bg-purple-50">
                    <td className="px-4 py-3 text-sm font-semibold">Optimistic</td>
                    <td className="px-4 py-3 text-center text-sm">16</td>
                    <td className="px-4 py-3 text-center text-sm">24</td>
                    <td className="px-4 py-3 text-right text-sm font-bold">KSh 4.2M</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 9. SCALABILITY & GROWTH */}
        <section id="scalability" className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-pink-100 rounded-full p-3">
              <TrendingUp className="w-8 h-8 text-pink-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">9. Scalability & Growth Strategy</h2>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 mb-6 border-2 border-pink-300">
            <h3 className="text-xl font-bold text-gray-900 mb-3">🚀 Why EpiPredict Scales Fast</h3>
            <p className="text-gray-700 leading-relaxed">
              SaaS model with <strong>low marginal costs</strong> per new customer. Once built, adding a new hospital 
              or county costs <strong>only KSh 60K/month</strong> in variable costs while generating <strong>KSh 125K+ in revenue</strong> 
              — a <strong>52% contribution margin</strong> that funds rapid expansion.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-600">
              <h3 className="text-lg font-bold text-green-900 mb-4">📍 Geographic Expansion Path</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">Phase 1: Nairobi</span>
                    <Badge className="bg-green-600">Months 1-6</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Pilot hub, prove value, 3-5 paying customers</p>
                  <div className="text-xs text-gray-500 mt-2">Target: KSh 4M ARR</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">Phase 2: Urban Cities</span>
                    <Badge className="bg-blue-600">Months 7-18</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Mombasa, Kisumu, Nakuru, Eldoret - 40 customers</p>
                  <div className="text-xs text-gray-500 mt-2">Target: KSh 50M ARR</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">Phase 3: All 47 Counties</span>
                    <Badge className="bg-purple-600">Months 19-36</Badge>
                  </div>
                  <p className="text-sm text-gray-600">National coverage, government partnerships</p>
                  <div className="text-xs text-gray-500 mt-2">Target: KSh 150M ARR</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-600">
              <h3 className="text-lg font-bold text-blue-900 mb-4">🎯 Customer Acquisition Channels</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <div className="font-semibold text-gray-900 mb-1">Direct Sales (40% of budget)</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• CEO/Medical Director face-to-face meetings</li>
                    <li>• County Health CEC presentations</li>
                    <li>• Alumni network referrals (UoN, AKU)</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="font-semibold text-gray-900 mb-1">Healthcare Conferences (27%)</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Kenya Hospital Association Conference</li>
                    <li>• East Africa Healthcare Summit</li>
                    <li>• Digital Health Kenya (iHub)</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="font-semibold text-gray-900 mb-1">Digital Marketing (20%)</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• LinkedIn targeting healthcare leaders</li>
                    <li>• Twitter (#KOT) during health crises</li>
                    <li>• WhatsApp Business communication</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center border-2 border-purple-600">
              <div className="text-4xl mb-2">🌍</div>
              <div className="text-3xl font-bold text-purple-700 mb-2">47</div>
              <div className="text-sm text-gray-700 font-semibold">Kenyan Counties</div>
              <div className="text-xs text-gray-600 mt-2">Total addressable market</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center border-2 border-green-600">
              <div className="text-4xl mb-2">🏥</div>
              <div className="text-3xl font-bold text-green-700 mb-2">50M+</div>
              <div className="text-sm text-gray-700 font-semibold">Kenyans Protected</div>
              <div className="text-xs text-gray-600 mt-2">At full national scale</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center border-2 border-blue-600">
              <div className="text-4xl mb-2">💰</div>
              <div className="text-3xl font-bold text-blue-700 mb-2">KSh 50M+</div>
              <div className="text-sm text-gray-700 font-semibold">Costs Saved (Customers)</div>
              <div className="text-xs text-gray-600 mt-2">Annually across healthcare system</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-500">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🌍 Future International Expansion (Year 3+)</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong className="text-orange-700">East Africa:</strong>
                <p className="text-gray-700 mt-1">Uganda, Tanzania, Rwanda - similar disease patterns, shared Swahili language</p>
              </div>
              <div>
                <strong className="text-orange-700">West Africa:</strong>
                <p className="text-gray-700 mt-1">Nigeria, Ghana - large markets with cholera/malaria challenges</p>
              </div>
              <div>
                <strong className="text-orange-700">Southeast Asia:</strong>
                <p className="text-gray-700 mt-1">Philippines, Indonesia - dengue/malaria hotspots, high social media use</p>
              </div>
            </div>
          </div>
        </section>

        {/* 10. TEAM & GOVERNANCE */}
        <section id="team" className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-teal-100 rounded-full p-3">
              <Users className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">10. Team & Governance</h2>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-6 mb-6 border-2 border-teal-300">
            <h3 className="text-xl font-bold text-gray-900 mb-3">👥 Core Team Structure (7 people)</h3>
            <p className="text-gray-700 mb-4">
              Lean, experienced team with deep Kenya healthcare and AI expertise. Mix of technical builders and business operators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-600">
              <h3 className="text-lg font-bold text-blue-900 mb-4">🔬 Technical Team (4 people)</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <div className="font-bold text-gray-900 mb-1">Chief Technology Officer (CTO)</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 10+ years AI/ML experience</li>
                    <li>• Former Google/Microsoft engineer</li>
                    <li>• PhD in Computer Science (NLP)</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="font-bold text-gray-900 mb-1">Senior ML Engineer (2)</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Disease prediction models</li>
                    <li>• Swahili/Sheng NLP specialists</li>
                    <li>• Kenya-based (UoN/Strathmore grads)</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="font-bold text-gray-900 mb-1">Full-Stack Developer</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Dashboard & mobile apps</li>
                    <li>• API integrations (NHIF, M-Pesa)</li>
                    <li>• DevOps & infrastructure</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-600">
              <h3 className="text-lg font-bold text-green-900 mb-4">💼 Business Team (3 people)</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4">
                  <div className="font-bold text-gray-900 mb-1">Chief Executive Officer (CEO)</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Healthcare background (10+ years)</li>
                    <li>• Former hospital administrator</li>
                    <li>• Nairobi networks (KNH, MOH)</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="font-bold text-gray-900 mb-1">Head of Sales & Partnerships</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• B2B healthcare sales expert</li>
                    <li>• County government relationships</li>
                    <li>• Pharmacy chain connections</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="font-bold text-gray-900 mb-1">Customer Success Manager</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Pilot onboarding & training</li>
                    <li>• 24/7 support coordination</li>
                    <li>• Clinical background (nurse/pharmacist)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-600">
              <h3 className="text-lg font-bold text-purple-900 mb-4">🎓 Advisory Board</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span><strong>Hospital CEO:</strong> Kenyatta National Hospital or Coast General (operational insights)</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span><strong>AI Researcher:</strong> University of Nairobi or KEMRI (technical validation)</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span><strong>County Health CEC:</strong> Nairobi or Mombasa (government partnerships)</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span><strong>Investor/Entrepreneur:</strong> Savannah Fund or 4DX Ventures partner (fundraising guidance)</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border-2 border-orange-600">
              <h3 className="text-lg font-bold text-orange-900 mb-4">🏛️ Governance & Compliance</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <span><strong>Data Protection:</strong> Kenya Data Protection Act (DPA) 2019 compliant</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <span><strong>Healthcare Standards:</strong> Working toward HIPAA compliance for international expansion</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <span><strong>Ministry of Health:</strong> Partnership for IDSR integration and national rollout</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <span><strong>Board Structure:</strong> 5-person board (2 founders, 2 investors, 1 independent)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4">💡 Why This Team Will Win</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong className="text-green-400">Deep Kenya Expertise:</strong>
                <p className="text-gray-300 mt-1">Team knows Kenyan healthcare system, speaks the languages, has the networks</p>
              </div>
              <div>
                <strong className="text-blue-400">Technical Excellence:</strong>
                <p className="text-gray-300 mt-1">World-class AI/ML team from top tech companies, proven track record</p>
              </div>
              <div>
                <strong className="text-purple-400">Execution Focused:</strong>
                <p className="text-gray-300 mt-1">Lean team, no ego, obsessed with customer success and hitting milestones</p>
              </div>
            </div>
          </div>
        </section>

        {/* CLOSING SLIDE */}
        <div className="bg-gradient-to-r from-black via-red-600 to-green-600 rounded-xl shadow-2xl p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-6">🇰🇪 Join Us in Protecting Kenya</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-xl leading-relaxed">
              EpiPredict is building the future of disease prevention in Kenya. With <strong>KSh 40M seed funding</strong>, 
              we'll reach <strong>profitability in 19 months</strong>, protect <strong>5M+ Kenyans</strong> in Year 1, 
              and save the healthcare system <strong>KSh 50M+ annually</strong>.
            </p>
            
            <div className="grid md:grid-cols-4 gap-4 my-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">KSh 40M</div>
                <div className="text-sm opacity-90">Seed Round</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">19 Months</div>
                <div className="text-sm opacity-90">To Break-Even</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">KSh 23M</div>
                <div className="text-sm opacity-90">Year 1 Revenue</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">5M+</div>
                <div className="text-sm opacity-90">Lives Protected</div>
              </div>
            </div>

            <div className="text-lg">
              <strong className="text-yellow-300">Let's build the healthiest Kenya together.</strong>
            </div>

            <div className="pt-6 border-t border-white/20">
              <div className="text-sm opacity-90">Contact</div>
              <div className="text-lg font-semibold mt-1">hello@epipredict.co.ke | +254 712 345 678</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvestorPresentation;
